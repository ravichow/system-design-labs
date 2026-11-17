export interface LatencyNumber {
  operation: string;
  timeNs: number;
  timeFormatted: string;
  scaledSeconds: string;
  insight: string;
}

export const LATENCY_NUMBERS: LatencyNumber[] = [
  {
    operation: 'L1 CPU Cache reference',
    timeNs: 1,
    timeFormatted: '1 ns',
    scaledSeconds: '1 second',
    insight: 'Extremely fast on-die SRAM.'
  },
  {
    operation: 'Branch mispredict',
    timeNs: 3,
    timeFormatted: '3 ns',
    scaledSeconds: '3 seconds',
    insight: 'CPU pipeline flush.'
  },
  {
    operation: 'L2 CPU Cache reference',
    timeNs: 4,
    timeFormatted: '4 ns',
    scaledSeconds: '4 seconds',
    insight: 'Approx 4x slower than L1.'
  },
  {
    operation: 'Mutex lock / unlock',
    timeNs: 17,
    timeFormatted: '17 ns',
    scaledSeconds: '17 seconds',
    insight: 'Atomic thread synchronization overhead.'
  },
  {
    operation: 'Main Memory (RAM) reference',
    timeNs: 100,
    timeFormatted: '100 ns',
    scaledSeconds: '1.7 minutes',
    insight: '100x slower than L1 cache.'
  },
  {
    operation: 'Compress 1KB with Snappy/Zstd',
    timeNs: 2000,
    timeFormatted: '2 µs',
    scaledSeconds: '33 minutes',
    insight: 'Fast CPU compression.'
  },
  {
    operation: 'Send 2KB over 1 Gbps network',
    timeNs: 20000,
    timeFormatted: '20 µs',
    scaledSeconds: '5.5 hours',
    insight: 'Network serialization.'
  },
  {
    operation: 'SSD Random Read (NVMe)',
    timeNs: 50000,
    timeFormatted: '50 µs',
    scaledSeconds: '14 hours',
    insight: 'Flash memory read latency.'
  },
  {
    operation: 'Read 1 MB sequentially from RAM',
    timeNs: 250000,
    timeFormatted: '250 µs',
    scaledSeconds: '2.9 days',
    insight: 'Sequential memory scan.'
  },
  {
    operation: 'Round trip within same Datacenter',
    timeNs: 500000,
    timeFormatted: '0.5 ms',
    scaledSeconds: '5.8 days',
    insight: 'East-west intra-DC network latency.'
  },
  {
    operation: 'Read 1 MB sequentially from SSD',
    timeNs: 1000000,
    timeFormatted: '1 ms',
    scaledSeconds: '11.6 days',
    insight: 'High throughput sequential SSD.'
  },
  {
    operation: 'HDD Mechanical Disk Seek',
    timeNs: 10000000,
    timeFormatted: '10 ms',
    scaledSeconds: '3.8 months',
    insight: 'Physical spinning disk head seek.'
  },
  {
    operation: 'Round trip packet: SF to NYC',
    timeNs: 65000000,
    timeFormatted: '65 ms',
    scaledSeconds: '2.1 years',
    insight: 'Cross-continent speed of light in fiber.'
  },
  {
    operation: 'Round trip packet: SF to London',
    timeNs: 150000000,
    timeFormatted: '150 ms',
    scaledSeconds: '4.8 years',
    insight: 'Transatlantic undersea cable latency.'
  }
];

export const POWERS_OF_TWO = [
  { power: '2^10', val: '1,024', unit: '1 KB (Thousand)' },
  { power: '2^20', val: '1,048,576', unit: '1 MB (Million)' },
  { power: '2^30', val: '1,073,741,824', unit: '1 GB (Billion)' },
  { power: '2^40', val: '1,099,511,627,776', unit: '1 TB (Trillion)' },
  { power: '2^50', val: '1,125,899,906,842,624', unit: '1 PB (Quadrillion)' }
];

export const PROTOCOL_COMPARISON = [
  {
    protocol: 'REST (HTTP/1.1 or HTTP/2)',
    payload: 'JSON / XML',
    transport: 'TCP / TLS',
    bestFor: 'Public web APIs, CRUD resource operations, browser clients',
    drawbacks: 'Higher serialization overhead, larger payload size than binary'
  },
  {
    protocol: 'gRPC (HTTP/2)',
    payload: 'Protocol Buffers (Binary)',
    transport: 'HTTP/2 (Multiplexed TCP)',
    bestFor: 'Internal microservice-to-microservice communication, high QPS low latency',
    drawbacks: 'Requires code generation; browser support requires gRPC-Web proxy'
  },
  {
    protocol: 'GraphQL',
    payload: 'JSON',
    transport: 'HTTP (POST)',
    bestFor: 'Client-driven queries, aggregating data from multiple services, mobile apps',
    drawbacks: 'Difficult HTTP-level caching, risk of N+1 query vulnerability'
  },
  {
    protocol: 'WebSockets',
    payload: 'Text / Binary Frames',
    transport: 'Full-duplex persistent TCP',
    bestFor: 'Real-time collaborative editing, chat apps, gaming, live tickers',
    drawbacks: 'Stateful connections complicate horizontal load balancing'
  },
  {
    protocol: 'Server-Sent Events (SSE)',
    payload: 'UTF-8 Event Streams',
    transport: 'HTTP (Chunked transfer)',
    bestFor: 'One-way server-to-client streaming (e.g. LLM tokens, stock alerts)',
    drawbacks: 'Unidirectional only (client cannot push back over same stream)'
  }
];

export const CACHING_PATTERNS = [
  {
    name: 'Cache-Aside (Lazy Loading)',
    flow: 'App reads from Cache → On Miss, App reads from DB → App writes to Cache',
    pros: 'Only requested data is cached; cache failures do not break the app (falls back to DB).',
    cons: 'Cache misses introduce higher latency; potential for stale data if DB is updated directly.',
    bestFor: 'General read-heavy workloads (user profiles, articles, product catalogs).'
  },
  {
    name: 'Write-Through',
    flow: 'App writes to Cache → Cache synchronously writes to Database before returning OK',
    pros: 'Data in cache is never stale; immediate consistency between cache and DB.',
    cons: 'Higher write latency (must write to two stores sequentially); caches data that may never be read.',
    bestFor: 'Financial systems or applications where dirty reads cannot be tolerated.'
  },
  {
    name: 'Write-Behind (Write-Back)',
    flow: 'App writes to Cache (returns OK immediately) → Cache asynchronously flushes writes to DB in batches',
    pros: 'Blazing fast write latency; can coalesce multiple writes into one DB batch insert.',
    cons: 'Risk of permanent data loss if cache crashes before flushing dirty pages to disk.',
    bestFor: 'Heavy write workloads like click tracking, view counters, IoT telemetry.'
  },
  {
    name: 'Refresh-Ahead',
    flow: 'Cache predicts key expiration and automatically queries the DB to refresh before TTL expires',
    pros: 'Eliminates cache miss penalties completely for hot keys.',
    cons: 'Requires accurate prediction models; complex to implement reliably.',
    bestFor: 'High-traffic homepages or predictable scheduled access spikes.'
  }
];

