import { ModuleInfo } from '../types';

export const CURRICULUM: ModuleInfo[] = [
  {
    id: 'foundations',
    num: '01',
    title: 'Foundations',
    color: 'sand',
    lessons: [
      { id: 'request-lifecycle', title: 'How a Request Travels', ready: true },
      { id: 'latency-throughput', title: 'Latency & Throughput', ready: true },
      { id: 'napkin-math', title: 'Napkin Math', ready: true }
    ]
  },
  {
    id: 'scaling',
    num: '02',
    title: 'Scaling',
    color: 'green',
    lessons: [
      { id: 'vertical-horizontal', title: 'Vertical vs Horizontal', ready: true },
      { id: 'load-balancing', title: 'Load Balancing', ready: true },
      { id: 'stateless', title: 'Stateless Services', ready: true },
      { id: 'caching', title: 'Caching', ready: true },
      { id: 'cdn', title: 'Content Delivery', ready: true }
    ]
  },
  {
    id: 'data',
    num: '03',
    title: 'Data & Storage',
    color: 'violet',
    lessons: [
      { id: 'sql-nosql', title: 'SQL vs NoSQL', ready: true },
      { id: 'indexes', title: 'Indexes', ready: true },
      { id: 'storage-engines', title: 'Storage Engines', ready: true },
      { id: 'replication', title: 'Replication', ready: true },
      { id: 'sharding', title: 'Sharding', ready: true },
      { id: 'consistent-hashing', title: 'Consistent Hashing', ready: true },
      { id: 'unique-ids', title: 'Unique IDs at Scale', ready: true },
      { id: 'cap', title: 'CAP & Consistency', ready: true },
      { id: 'consensus', title: 'Consensus & Leaders', ready: true },
      { id: 'transactions', title: 'Transactions & Isolation', ready: true },
      { id: 'files', title: 'Files & Media', ready: true }
    ]
  },
  {
    id: 'communication',
    num: '04',
    title: 'Communication',
    color: 'orange',
    lessons: [
      { id: 'apis', title: 'REST, RPC & GraphQL', ready: true },
      { id: 'queues', title: 'Message Queues', ready: true },
      { id: 'pubsub', title: 'Pub/Sub & Events', ready: true },
      { id: 'realtime', title: 'Real-time Updates', ready: true }
    ]
  },
  {
    id: 'reliability',
    num: '05',
    title: 'Reliability',
    color: 'blue',
    lessons: [
      { id: 'redundancy', title: 'Redundancy & Failover', ready: true },
      { id: 'rate-limiting', title: 'Rate Limiting', ready: true },
      { id: 'timeouts-retries', title: 'Timeouts & Retries', ready: true },
      { id: 'observability', title: 'Observability', ready: true }
    ]
  },
  {
    id: 'architecture',
    num: '06',
    title: 'Architecture',
    color: 'teal',
    lessons: [
      { id: 'microservices', title: 'Monolith vs Microservices', ready: true },
      { id: 'service-discovery', title: 'Service Discovery', ready: true },
      { id: 'sagas', title: 'Sagas & Distributed Tx', ready: true },
      { id: 'batch-stream', title: 'Batch & Stream Processing', ready: true }
    ]
  },
  {
    id: 'security',
    num: '07',
    title: 'Security',
    color: 'rose',
    lessons: [
      { id: 'authentication', title: 'Authentication', ready: true },
      { id: 'authorization', title: 'Authorization', ready: true },
      { id: 'encryption', title: 'Encryption & Secrets', ready: true }
    ]
  },
  {
    id: 'shipping',
    num: '08',
    title: 'Shipping',
    color: 'olive',
    lessons: [
      { id: 'testing', title: 'Testing', ready: true },
      { id: 'cicd', title: 'CI/CD & Deployments', ready: true }
    ]
  },
  {
    id: 'design',
    num: '09',
    title: 'Whole Systems',
    color: 'slate',
    lessons: [
      { id: 'hld-lld', title: 'HLD & LLD', ready: true },
      { id: 'design-url-shortener', title: 'Design a URL Shortener', ready: true },
      { id: 'design-news-feed', title: 'Design a News Feed', ready: true },
      { id: 'design-chat', title: 'Design a Chat System', ready: true }
    ]
  }
];

export function findLesson(id: string) {
  for (const mod of CURRICULUM) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return { ...lesson, module: mod };
  }
  return null;
}
