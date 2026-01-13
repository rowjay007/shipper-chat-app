# Ghost Users & Zombie Dependencies: A Real-Time Postmortem

*By Rowland Adimoha*

## The Premise of Connection

In the age of the "always-on" web, silence is an error state.

I grew up when connection was audible—a screeching, cacophonous modem handshake that announced you were breaching the void. Today, connection is silent. It is assumed. We expect our avatars to glow green the moment we open a laptop; we expect messages to arrive before we've finished the thought that spawned them.

But for us—the engineers who build the plumbing beneath the floorboards—this silence is terrifying. Because when the green light doesn't turn on, or when the message doesn't arrive, there is no screeching modem to tell us why. There is only a silent, unresponsive DOM.

This week, I was called into the engine room of the `shipper-chat-app`. The report was clinically dry: "Users appearing offline. Invalid dates. Messages require refresh."

What I found was not a simple bug. It was a collision of three tectonic plates of modern software engineering:
1.  **The hallucinations of dependency management** (using libraries that don't exist).
2.  **The subtle treachery of distributed state** (CRDTs and the "Lurker Problem").
3.  **The infinite complexity of time** (ISO 8601 vs. the chaos of human systems).

This is not just a postmortem. This is a critical look at how we build, how these systems actually work (down to the Write-Ahead Log), and how we rebuilt the nervous system of an application while it was still running.

## The Archaeology of a Red Herring: Socket.io

Every debugging session begins with a mental model. You look at a codebase, and your brain builds a map. *Okay, it's a chat app. Real-time. Node.js backend.*

I opened `package.json`. It stared back at me, confident and welcoming:

```json
"dependencies": {
  "socket.io": "^4.7.4",
  "socket.io-client": "^4.7.4",
  ...
}
```

My brain immediately latched onto this anchor. "Excellent," I thought. "I know this stack." I prepared to debug a Node.js WebSocket server, checking for heartbeats and Nginx upgrade headers.

But as I grep'd the codebase for `.connect()`, I found nothing. The results were ghost towns.

The library was installed. The mental model was plausible. But the code was dead.

### The Danger of Zombie Dependencies

In a large codebase, `package.json` is often treated as the source of truth for the stack. But it lies. It records history, not reality.

The presence of `socket.io` here was **cognitive debt**. It forced every new engineer (like me) to waste critical initial energy investigating a path that led nowhere. We later discovered the application was actually built on **Supabase**, utilizing serverless subscriptions to a PostgreSQL database.

**Engineering Principle**: *The most dangerous code is the code that isn't running, but looks like it is.* If you migrate away from a technology, you must burn the boats. Uninstall the package. Remove the configuration.

## The Architecture of Supabase Realtime (The "Phoenix" in the Room)

To understand why the users were appearing offline, we have to understand what replaced Socket.io.

Supabase is not just "Firebase for SQL." Its real-time engine is a fascinating piece of engineering called **Realtime**, written in Elixir and utilizing the **Phoenix Framework**.

When you subscribe to a database change (e.g., "new message"), a Rube Goldberg machine fires:
1.  **Postgres**: You insert a row.
2.  **WAL (Write-Ahead Log)**: Postgres writes this change to its transaction log.
3.  **Realtime Service**: A service listening to the replication stream sees the WAL entry.
4.  **Phoenix Channels**: The service broadcasts this generic JSON object to millions of connected WebSockets.

This shift from "Event-Driven" (Socket.io) to "Data-Driven" (Supabase) is powerful, but it introduces a new class of bugs.

### The "Presence" Problem

Presence—the green dot—is different. You don't want to write "Rowjay is online" to a Postgres table every 5 seconds. That would destroy your database IOPS.

So Supabase handles Presence purely in the ephemeral memory of the Elixir cluster using **CRDTs (Conflict-Free Replicated Data Types)**. When User A goes online, they don't tell the database. They tell the *channel*. "I am here."

This brings us to the bug.

## The Lurker Problem

I opened `components/chat/userList.tsx`:

```typescript
const channel = supabase
  .channel('presence')
  .on('presence', { event: 'sync' }, () => {
    setOnlineUsers(channel.presenceState())
  })
  .subscribe()
```

It looks correct. It creates a channel. It listens. But everyone was offline.

The flaw is in the passivity. This code is a **Lurker**. It connects to the room, stands in the corner, and listens. But it never announces itself. In a CRDT system, if everyone listens and nobody speaks, the state is empty.

### The Fix: Asserting Existence

We had to fundamentally change the implementation from passive observation to active participation. We needed to call `.track()`.

```typescript
.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
    })
  }
})
```

This single method call is the difference between a Lurker and a Participant. Once we deployed this, the green dots flickered to life. The system woke up.

## The Infinite Complexity of Time

Ah, dates. The eternal enemy of the software engineer. The user gathered screenshots showing `Invalid Date` scattered across the UI like shrapnel.

In our codebase, we were doing something naive: trusting the data.

```typescript
// The Naive Approach
export function formatTimestamp(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}
```

This code works 99% of the time. But "99% uptime" means you're down for 3.65 days a year. Postgres is strict about time; JavaScript is loose. `new Date(undefined)` returns `Invalid Date`.

The fix was **Defensive Programming**. We treat every date string as a potential biological hazard until proven innocent.

```typescript
export function formatTimestamp(date: any): string {
  if (!date) return 'Unknown';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString();
}
```

Now, even if the data is corrupted, the UI renders "Unknown" instead of crashing.

## The UI: Sidebar Psychology

Finally, we tackled the User Interface. The original sidebar was a jumbled list of tools and users, violating the principle of **Visual Hierarchy**.

*   **Tools** (Search, New Chat) are transactional. They belong at the top.
*   **Content** (Users) is consumable. It belongs in the middle, gaining the most space.
*   **Context** (AI, Profile) is meta. It belongs at the bottom, grounded.

We moved the "AI Chat" button to the bottom, creating a clean mental model: *"Here is your workbench. Here is your list of people. Here are your foundational tools."*

## Why This Tech Stack? (And Why It Won't Scale)

We must ask a hard question: Why did we build it this way? And what happens when we scale from 100 users to 100,000?

### The Case for Supabase (Speed to Value)
We chose Supabase for **Velocity**.
1.  **Unified Auth & DB**: No need to write manual JWT middleware.
2.  **Instant Real-time**: The `postgres_changes` listener gives us "chat" for free.
3.  **Serverless**: Zero DevOps on day one.

### The Case Against Supabase (The Enterprise Cliff)
However, at **Enterprise Production Levels** (millions of concurrents), this fails:

1.  **The Postgres Bottleneck**: Writing 50,000 messages/sec via standard `INSERT`s will lock rows and degrade performance. Postgres is not a message bus.
2.  **Connection Limits**: A massive burst of users tracking presence can overwhelm the CRDT sync capacity of standard tiers.

### The Enterprise Architecture: What We Would Build Instead

To rebuild for massive scale (think Slack/Discord), we would decouple **State** from **Persistence**.

1.  **Ingestion (Kafka)**: Write message events to a high-throughput stream, decoupling sending from saving.
2.  **Real-Time (Dedicated WebSockets)**: A dedicated Go or Node.js fleet for finer connection control.
3.  **State (Redis)**: Move Presence out of Supabase CRDTs and into Redis Sets for O(1) access.
4.  **Persistence (ScyllaDB)**: Move chat history to a wide-column store optimized for writes.

This architecture requires DevOps, monitoring, and money. It is overkill for today, but specific knowledge for tomorrow.

## Conclusion

Building software is a series of trade-offs. We chose Supabase for its elegance, accepting that it ties our real-time performance to our database throughput. We chose to fix the "Presence" bug by deep-diving into the active tracking mechanisms of Phoenix Channels rather than ripping out the library.

We learned that trust is something you build, not something you install via `npm`. We learned that time is fragile. And we learned that even in the age of AI and serverless, the fundamental primitives of distributed systems—state, synchronization, and latency—remain the hardest things to get right.

The modem doesn't screech anymore. But if you listen closely to the Chrome DevTools Network tab, you can hear the heartbeat of the system we built together. *Ping. Pong. Ping. Pong.*

The system is alive.

## References

**Supabase Realtime Architecture**
[https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)

**Phoenix Channels & Presence**
[https://hexdocs.pm/phoenix/channels.html](https://hexdocs.pm/phoenix/channels.html)

**CRDTs (Conflict-Free Replicated Data Types)**
[https://crdt.tech/](https://crdt.tech/)

**PostgreSQL Write-Ahead Logging (WAL)**
[https://www.postgresql.org/docs/current/wal.html](https://www.postgresql.org/docs/current/wal.html)

**Javascript Date Parsing (MDN)**
[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

**Zustand State Management**
[https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
