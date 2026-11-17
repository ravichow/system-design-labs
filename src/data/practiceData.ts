import { QuizScenario, MathChallenge } from '../types';

export const PRACTICE_QUIZZES: QuizScenario[] = [
  {
    id: 'cache-stampede',
    category: 'Caching & Reliability',
    difficulty: 'Medium',
    title: 'The Celebrity Tweet & Cache Stampede',
    scenario:
      'A popular celebrity with 50M followers posts an update. The cached JSON payload has a 60-second TTL. The exact second the cache key expires, 85,000 concurrent requests arrive. All 85,000 requests miss Redis simultaneously and hammer your PostgreSQL primary with identical complex queries. The DB CPU spikes to 100% and crashes.',
    metricsGiven: {
      'Cache TTL': '60 seconds',
      'Concurrent Requests': '85,000 / sec',
      'Database Connection Pool': '200 connections max'
    },
    options: [
      {
        id: 'opt1',
        text: 'Increase PostgreSQL connection pool to 100,000 connections so every query gets handled.',
        tradeoff: 'Causes catastrophic memory thrashing and OS process crashes; PostgreSQL connections are heavy processes (10MB+ RAM each).'
      },
      {
        id: 'opt2',
        text: 'Implement Mutex Locking (Singleflight / Probabilistic Early Expiration / XFetch) so only 1 worker regenerates the cache.',
        tradeoff: 'Ideal solution. 1 request queries the DB and populates Redis; the other 84,999 wait briefly or serve stale data for 100ms.'
      },
      {
        id: 'opt3',
        text: 'Remove the TTL completely so the cache never expires.',
        tradeoff: 'Data becomes permanently stale; memory grows unbounded until Redis crashes with OOM (Out Of Memory).'
      },
      {
        id: 'opt4',
        text: 'Deploy 50 read replicas to absorb the 85,000 identical queries.',
        tradeoff: 'Extremely expensive; still creates replication lag and wastes millions of CPU cycles on identical work.'
      }
    ],
    correctId: 'opt2',
    explanation:
      'This classic failure is known as a Cache Stampede (or Dog-piling / Thundering Herd). When a hot key expires, multiple concurrent requests simultaneously find a cache miss and execute the expensive database query. Implementing Mutex Locks (e.g. Go singleflight, Redis SETNX distributed lock) or Probabilistic Early Expiration (XFetch algorithm) ensures only ONE worker queries the database while others wait or serve slightly stale data.',
    architectureInsight:
      'Always protect backend storage from cache thundering herds using distributed mutexes, early background refresh, or stale-while-revalidate headers.'
  },
  {
    id: 'sharding-key',
    category: 'Data & Storage',
    difficulty: 'Hard',
    title: 'Picking a Database Sharding Key for an E-Commerce Platform',
    scenario:
      'You are designing the Orders table for an international marketplace with 150 million orders per month. A single database node can no longer fit the data. You must choose a sharding key to distribute data across 16 database shards.',
    metricsGiven: {
      'Monthly Orders': '150 Million',
      'Query Pattern A (85%)': 'Users viewing their order history',
      'Query Pattern B (15%)': 'Warehouse workers fulfilling orders by warehouse_id'
    },
    options: [
      {
        id: 'opt1',
        text: 'Shard by order_created_at timestamp so recent orders stay together.',
        tradeoff: 'Creates a massive "Hot Shard" problem: 100% of new writes and reads hit only the single shard holding today’s date.'
      },
      {
        id: 'opt2',
        text: 'Shard by user_id hash: consistent_hash(user_id) % 16.',
        tradeoff: 'Excellent for 85% of queries (user order history is co-located on a single shard). Warehouse queries require a scatter-gather query across all 16 shards or a secondary search index.'
      },
      {
        id: 'opt3',
        text: 'Shard randomly by UUID order_id.',
        tradeoff: 'Distributes writes evenly, but EVERY single user history query becomes an expensive scatter-gather query across all 16 shards.'
      },
      {
        id: 'opt4',
        text: 'Do not shard; keep vertical scaling with 2TB RAM instances.',
        tradeoff: 'Astronomical cost and hits hard physical hardware limits within 6 months.'
      }
    ],
    correctId: 'opt2',
    explanation:
      'Sharding by `user_id` aligns with the dominant query pattern (85% of traffic). When a user checks their order history, the query routes deterministically to a single shard with zero cross-network joins. For the 15% warehouse fulfillment query, companies maintain an asynchronous search index (like Elasticsearch) or a secondary lookup table keyed by warehouse_id.',
    architectureInsight:
      'Choose your sharding key based on the primary access path to prevent scatter-gather queries across every shard.'
  },
  {
    id: 'cap-partition',
    category: 'Distributed Systems',
    difficulty: 'Hard',
    title: 'Network Partition in an ATM Financial Ledger',
    scenario:
      'A transatlantic fiber optic cable is cut by an anchor. Your primary datacenter in New York and secondary datacenter in London lose communication. An ATM customer in London tries to withdraw $500 from an account that currently has $600.',
    options: [
      {
        id: 'opt1',
        text: 'Prioritize Availability (AP): Allow the withdrawal in London immediately without contacting New York.',
        tradeoff: 'Customer can simultaneously withdraw $500 in London AND $500 in New York, double-spending and resulting in a $400 negative balance.'
      },
      {
        id: 'opt2',
        text: 'Prioritize Consistency (CP): Refuse or pause the withdrawal in London until the partition heals or quorum is established.',
        tradeoff: 'Customers experience downtime or degraded service, but financial data integrity is strictly preserved (no money created from thin air).'
      },
      {
        id: 'opt3',
        text: 'Rely on both Consistency and Availability without Partition Tolerance (CA).',
        tradeoff: 'Impossible. In distributed systems, network partitions (P) are an inescapable physical reality. You must choose between C and A during a partition.'
      }
    ],
    correctId: 'opt2',
    explanation:
      'By the CAP theorem, when a network partition (P) occurs, you MUST choose between Consistency (C) and Availability (A). For financial transactions and banking ledgers, Consistency is paramount: banks would rather reject an ATM transaction or show a temporary maintenance screen than permit double-spending. For social media likes or view counters, AP is preferred.',
    architectureInsight:
      'You cannot choose "CA" over the internet because network failures cannot be prevented. In a partition, pick CP for ledgers and AP for social feeds.'
  }
];

export const MATH_CHALLENGES: MathChallenge[] = [
  {
    id: 'twitter-storage',
    title: 'Twitter / X Media Storage Estimation',
    problem:
      'Estimate the daily media storage capacity required for a microblogging platform with 200 Million Daily Active Users (DAU).',
    variables: [
      { name: 'DAU', val: '200 Million', desc: 'Daily active users' },
      { name: 'Tweets per user/day', val: '0.5 avg', desc: 'Total of 100 Million tweets/day' },
      { name: 'Media ratio', val: '20%', desc: '20% of tweets include an image' },
      { name: 'Average image size', val: '250 KB', desc: 'Compressed WebP/JPEG' }
    ],
    question: 'How many Terabytes (TB) of raw media storage are needed per day?',
    unit: 'TB/day',
    correctAnswer: 5,
    tolerancePct: 15,
    formula: '100M tweets × 20% with media = 20M images/day. 20M × 250 KB = 5,000,000,000 KB = 5,000 GB = 5 TB/day.',
    explanation:
      'Calculation:\n1. Total tweets/day = 200M users × 0.5 = 100 Million tweets/day.\n2. Total images/day = 100M × 0.20 = 20 Million images/day.\n3. Daily Storage = 20,000,000 × 250 KB = 5,000,000 MB = 5,000 GB = 5 TB/day.\n\nPer year: 5 TB × 365 ≈ 1.8 Petabytes (PB) before replication redundancy (3x = ~5.4 PB/year).'
  },
  {
    id: 'url-qps',
    title: 'URL Shortener (TinyURL) Read/Write QPS',
    problem:
      'Design TinyURL for 100 Million new URLs created per month, with a 100:1 Read to Write ratio.',
    variables: [
      { name: 'New URLs / month', val: '100 Million', desc: 'Write requests per month' },
      { name: 'Seconds / month', val: '~2.5 Million', desc: '30 days × 86,400s ≈ 2.59M seconds' },
      { name: 'Read:Write Ratio', val: '100 : 1', desc: '100 reads for every 1 short URL created' }
    ],
    question: 'What is the average Read Queries Per Second (QPS)?',
    unit: 'req/sec',
    correctAnswer: 4000,
    tolerancePct: 20,
    formula: 'Write QPS = 100M / 2.5M ≈ 40 QPS. Read QPS = 40 QPS × 100 = 4,000 QPS (Peak ~8,000 QPS).',
    explanation:
      'Calculation:\n1. 1 month ≈ 2.5 × 10^6 seconds (approx. 2.59M s).\n2. Write QPS = 100,000,000 / 2,500,000 ≈ 40 writes/sec.\n3. Read:Write ratio is 100:1, so Read QPS = 40 × 100 = 4,000 reads/sec.\n4. Peak Read QPS (typically 2x) = ~8,000 QPS.\n\nA single Redis or Memcached node can easily serve 100,000 QPS in-memory!'
  }
];

export const COMPONENT_MATCHES = [
  {
    requirement: 'Sub-millisecond key-value reads for session tokens and hot product counters',
    technology: 'Redis',
    category: 'In-Memory Cache',
    reason: 'In-memory single-threaded event loop data structure store with sub-millisecond read/write latency.'
  },
  {
    requirement: 'High-throughput append-only distributed event stream with replayable offsets',
    technology: 'Apache Kafka',
    category: 'Message Streaming',
    reason: 'Sequential disk I/O, partition-based distributed log architecture with configurable retention.'
  },
  {
    requirement: 'Strict ACID compliance with complex multi-table joins for financial ledgers',
    technology: 'PostgreSQL',
    category: 'Relational Database',
    reason: 'Battle-tested relational engine supporting serializable transactions and referential integrity.'
  },
  {
    requirement: 'Full-text search with typo tolerance, faceted filtering, and inverted indexes',
    technology: 'Elasticsearch',
    category: 'Search Engine',
    reason: 'Built on Apache Lucene, specifically optimized for inverted indexes and tokenized text queries.'
  },
  {
    requirement: 'Stateless edge caching of static assets (images, CSS, JS) with DDoS protection',
    technology: 'Cloudflare CDN',
    category: 'Edge Network',
    reason: 'Anycast network terminating TLS close to the user with global edge points of presence (PoPs).'
  }
];

