import { LessonData } from '../../types';

export const loadBalancingLesson: LessonData = {
  id: 'load-balancing',
  moduleId: 'scaling',
  title: 'Load Balancing',
  summary: 'Distribute incoming traffic across server pools so no single node melts under pressure.',
  minutes: 12,
  level: 'beginner',
  metrics: ['rps', 'activeServers', 'avgCpu', 'p99Latency'],
  goals: [
    { text: 'Why single servers hit vertical limits', step: 0 },
    { text: 'How a Reverse Proxy / Load Balancer routes traffic', step: 1 },
    { text: 'Round Robin vs Least Connections vs IP Hash', step: 2 },
    { text: 'Health checks and handling node crashes gracefully', step: 3 }
  ],
  steps: [
    {
      short: 'Traffic Surge',
      chapter: 'problem',
      title: 'A single server melts under peak load',
      body: [
        'You launched your product on Hacker News. Traffic jumps from 200 req/s to 4,000 req/s.',
        'A single Web Server hits 100% CPU utilization. The operating system kernel queue fills up, TCP handshakes time out, and users see <code>504 Gateway Timeout</code> errors.'
      ],
      callout: {
        kind: 'warn',
        text: 'Vertical scaling (buying a bigger 128-core machine) only delays the bottleneck and introduces a catastrophic single point of failure (SPOF).'
      },
      metrics: { rps: 4000, activeServers: 1, avgCpu: 98, p99Latency: 2800 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Thousands of Users',
            tags: [{ text: '4,000 req/s', tone: 'red' }]
          },
          server1: {
            x: 0,
            y: 0,
            color: 'blue',
            glyph: 'server',
            label: 'App Server #1',
            cpu: 0.98,
            heat: 0.95,
            tags: [{ text: 'OVERLOADED', tone: 'red' }]
          }
        },
        links: {
          chokeLink: {
            pts: [[0, -10], [0, -2]],
            heads: 'end',
            color: '#c0392b',
            label: 'Flooding Requests'
          }
        },
        flows: [{ route: ['chokeLink'], kind: 'req', bounce: false, rate: 3.0 }]
      }
    },
    {
      short: 'Introduce Balancer',
      chapter: 'technique',
      title: 'Placing a Load Balancer in Front',
      body: [
        'Instead of exposing backend servers directly to the public internet, place a <span class="term">Load Balancer</span> (e.g. Nginx, HAProxy, AWS ALB) at the edge.',
        'Clients send requests to the load balancer IP. The load balancer terminates connections and forwards requests across a pool of identical, stateless app servers.'
      ],
      callout: {
        kind: 'tip',
        text: 'Load balancers operate at Layer 4 (TCP/UDP, ultra-fast routing) or Layer 7 (HTTP/HTTPS, smart routing based on cookies, path, or headers).'
      },
      changes: ['+ Layer 7 Load Balancer', '+ App Server #2 added', '- Server CPU drops from 98% to 52%'],
      metrics: { rps: 4000, activeServers: 2, avgCpu: 52, p99Latency: 110 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -14,
            color: 'sand',
            glyph: 'user',
            label: 'Traffic'
          },
          lb: {
            x: 0,
            y: -4,
            color: 'orange',
            glyph: 'balancer',
            label: ['Load', 'Balancer'],
            sub: 'Nginx / ALB'
          },
          server1: {
            x: -8,
            y: 8,
            color: 'blue',
            glyph: 'server',
            label: 'App Server #1',
            cpu: 0.52
          },
          server2: {
            x: 8,
            y: 8,
            color: 'blue',
            glyph: 'server',
            label: 'App Server #2',
            cpu: 0.52
          }
        },
        links: {
          inbound: {
            pts: [[0, -12], [0, -6]],
            heads: 'end',
            color: '#1d1b18'
          },
          lb1: {
            pts: [[-2, -2], [-8, 6]],
            heads: 'end',
            color: '#2f8a43',
            label: 'Round Robin'
          },
          lb2: {
            pts: [[2, -2], [8, 6]],
            heads: 'end',
            color: '#2f8a43'
          }
        },
        flows: [
          { route: ['inbound'], kind: 'req', bounce: false, rate: 1.8 },
          { route: ['lb1'], kind: 'req', bounce: false, rate: 1.2 },
          { route: ['lb2'], kind: 'req', bounce: false, rate: 1.2 }
        ]
      }
    },
    {
      short: 'Failover Resilience',
      chapter: 'solution',
      title: 'Surviving Server Crashes with Health Checks',
      body: [
        'Hardware fails and memory leaks happen. What happens when Server #1 suddenly crashes?',
        'The Load Balancer polls <code>/healthz</code> every 3 seconds. The moment Server #1 stops responding, the balancer immediately pulls it from the active rotation pool.',
        '100% of incoming requests are automatically rerouted to healthy nodes — zero dropped requests for end users.'
      ],
      callout: {
        kind: 'insight',
        text: 'This is high availability in action: individual machines become cattle, not pets.'
      },
      changes: ['! Server #1 crashes (DOWN)', '+ Health check detects failure in 3s', '+ Traffic rerouted smoothly to Server #2 & #3'],
      metrics: { rps: 4000, activeServers: 2, avgCpu: 68, p99Latency: 125 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -14,
            color: 'sand',
            glyph: 'user',
            label: 'Clients'
          },
          lb: {
            x: 0,
            y: -4,
            color: 'orange',
            glyph: 'balancer',
            label: 'Load Balancer'
          },
          server1: {
            x: -9,
            y: 8,
            color: 'sand',
            glyph: 'server',
            label: 'App Server #1',
            dead: 1,
            tags: [{ text: 'CRASHED (DOWN)', tone: 'red' }]
          },
          server2: {
            x: 0,
            y: 8,
            color: 'blue',
            glyph: 'server',
            label: 'App Server #2',
            cpu: 0.68
          },
          server3: {
            x: 9,
            y: 8,
            color: 'blue',
            glyph: 'server',
            label: 'App Server #3',
            cpu: 0.65
          }
        },
        links: {
          inbound: { pts: [[0, -12], [0, -6]], heads: 'end' },
          lb2: { pts: [[0, -2], [0, 6]], heads: 'end', color: '#2f8a43' },
          lb3: { pts: [[3, -2], [9, 6]], heads: 'end', color: '#2f8a43' }
        },
        flows: [
          { route: ['inbound'], kind: 'req', bounce: false, rate: 2.0 },
          { route: ['lb2'], kind: 'req', bounce: false, rate: 1.4 },
          { route: ['lb3'], kind: 'req', bounce: false, rate: 1.4 }
        ]
      }
    }
  ]
};

