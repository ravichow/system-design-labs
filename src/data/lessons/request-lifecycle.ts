import { LessonData } from '../../types';

export const requestLifecycleLesson: LessonData = {
  id: 'request-lifecycle',
  moduleId: 'foundations',
  title: 'How a Request Travels',
  summary: 'Follow one page load hop by hop — and discover where the time really goes.',
  minutes: 10,
  level: 'beginner',
  metrics: ['dns', 'connect', 'request', 'download', 'total'],
  goals: [
    { text: 'What DNS does and why it is cached', step: 1 },
    { text: 'Why TCP & TLS connections cost multiple round trips', step: 2 },
    { text: 'The full path: Browser → Web Server → Database → Response', step: 4 },
    { text: 'Where latency accumulates in real production systems', step: 5 }
  ],
  steps: [
    {
      short: 'Hit Enter',
      chapter: 'problem',
      title: 'Users say the shop feels slow',
      body: [
        'Before you can make any system faster, you must know where the milliseconds actually go.',
        'A user types <code>shop.example</code> and presses Enter. A fraction of a second later the product catalog renders. Under the hood, half a dozen machines exchange cryptographic handshakes, queries, and network packets.'
      ],
      callout: {
        kind: 'insight',
        text: 'Every web request is a multi-hop conversation between machines across physical fiber cables. Latencies compound at each hop.'
      },
      metrics: { dns: null, connect: null, request: null, download: null, total: null },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            type: 'block',
            color: 'sand',
            glyph: 'user',
            label: 'Browser',
            sub: 'Client Device',
            tags: [{ text: 'https://shop.example', tone: 'paper' }]
          }
        },
        links: {},
        flows: []
      }
    },
    {
      short: 'DNS Lookup',
      chapter: 'technique',
      title: 'Resolving the IP Address (DNS)',
      body: [
        'Routers and switches do not know what <code>shop.example</code> means — the Internet routes packets by numeric IP address.',
        'The browser sends a UDP query to a <span class="term">DNS Resolver</span>: <em>"Where is shop.example?"</em>',
        'The answer — <code>203.0.113.7</code> — arrives back in approximately 20 ms.'
      ],
      callout: {
        kind: 'tip',
        text: 'DNS answers include a Time-To-Live (TTL). For subsequent requests, the client OS caches this result and skips the lookup entirely.'
      },
      changes: ['+ DNS Resolver', '+ DNS Lookup: 20 ms latency'],
      metrics: { dns: 20, connect: null, request: null, download: null, total: 20 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Browser',
            tags: [{ text: 'shop.example', tone: 'paper' }]
          },
          dns: {
            x: 0,
            y: 0,
            color: 'orange',
            glyph: 'dns',
            label: 'DNS',
            sub: 'Resolver',
            tags: [{ text: '→ 203.0.113.7', tone: 'amber' }]
          }
        },
        links: {
          dnsLink: {
            pts: [[0, -10], [0, -2]],
            heads: 'both',
            color: '#a5650c',
            label: 'DNS Query (UDP 53)'
          }
        },
        flows: [{ route: ['dnsLink'], kind: 'ping', bounce: true, rate: 1.2 }]
      }
    },
    {
      short: 'TCP + TLS Handshake',
      chapter: 'technique',
      title: 'Opening an Encrypted Connection',
      body: [
        'Armed with the IP address, the browser reaches out to <code>203.0.113.7</code>.',
        'First, a <span class="term">TCP 3-way handshake</span> (SYN, SYN-ACK, ACK) establishes reliable delivery. Immediately following, a <span class="term">TLS 1.3 handshake</span> negotiates cryptographic keys.',
        'Because each step requires a round trip across physical distance (30 ms RTT), connecting burns 60 ms before a single byte of HTTP payload is transferred.'
      ],
      callout: {
        kind: 'insight',
        text: 'Round-trip time (RTT) is governed by the speed of light in fiber (~200 km/ms). No server CPU upgrade beats physics.'
      },
      changes: ['+ Web Server', '~ DNS answer cached', '+ TCP & TLS Handshake: 2 RTTs = 60 ms'],
      metrics: { dns: 20, connect: 60, request: null, download: null, total: 80 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Browser'
          },
          dns: {
            x: -8,
            y: 0,
            opacity: 0.45,
            glyph: 'dns',
            label: 'DNS',
            tags: [{ text: 'Cached', tone: 'gray' }]
          },
          server: {
            x: 10,
            y: 0,
            color: 'blue',
            glyph: 'server',
            label: ['Web Server', '203.0.113.7'],
            tags: [{ text: 'TLS 1.3 OK', tone: 'green' }]
          }
        },
        links: {
          connLink: {
            pts: [[0, -10], [10, -2]],
            heads: 'both',
            color: '#1f63a0',
            label: 'TCP SYN/ACK + TLS ClientHello'
          }
        },
        flows: [{ route: ['connLink'], kind: 'ping', bounce: true, rate: 1.5 }]
      }
    },
    {
      short: 'HTTP Request',
      chapter: 'technique',
      title: 'Sending the HTTP Request',
      body: [
        'With the secure tunnel established, the browser sends <code>GET /products HTTP/2</code>.',
        'The Web Server terminates the TLS connection, parses the headers, validates authentication cookies, and routes the request into your application runtime.'
      ],
      changes: ['+ HTTP GET /products', '+ Server processing starts (CPU ~30%)'],
      metrics: { dns: 20, connect: 60, request: 35, download: null, total: 115 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Browser'
          },
          server: {
            x: 10,
            y: 0,
            color: 'blue',
            glyph: 'server',
            label: 'Web Server',
            cpu: 0.35,
            tags: [{ text: 'GET /products', tone: 'blue' }]
          }
        },
        links: {
          reqLink: {
            pts: [[0, -10], [10, -2]],
            heads: 'end',
            color: '#1f63a0',
            label: 'HTTP/2 Stream'
          }
        },
        flows: [{ route: ['reqLink'], kind: 'req', bounce: false, rate: 1.0 }]
      }
    },
    {
      short: 'Database Query',
      chapter: 'technique',
      title: 'Querying the Database',
      body: [
        'Dynamic web apps do not store product catalogs in memory on the web server — they execute an SQL query against the <span class="term">Database</span>.',
        'The server issues <code>SELECT * FROM products WHERE status = "active" LIMIT 20</code> over the local VPC network.',
        'The database performs an index seek on SSD storage, materializes 20 rows, and returns the result in 15 ms.'
      ],
      callout: {
        kind: 'tip',
        text: 'Keep database connections inside a connection pool (e.g. PgBouncer) so the web server does not renegotiate TCP handshakes per query.'
      },
      changes: ['+ PostgreSQL Database', '+ SQL Query execution: 15 ms'],
      metrics: { dns: 20, connect: 60, request: 50, download: null, total: 130 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Browser'
          },
          server: {
            x: 10,
            y: 0,
            color: 'blue',
            glyph: 'server',
            label: 'Web Server',
            cpu: 0.65
          },
          db: {
            x: 10,
            y: 12,
            type: 'db',
            color: 'violet',
            glyph: 'database',
            label: 'PostgreSQL',
            tags: [{ text: '20 rows (15ms)', tone: 'green' }]
          }
        },
        links: {
          reqLink: {
            pts: [[0, -10], [10, -2]],
            heads: 'none',
            color: '#c6bbac'
          },
          dbLink: {
            pts: [[10, 2], [10, 10]],
            heads: 'both',
            color: '#7c63d0',
            label: 'SELECT * FROM products'
          }
        },
        flows: [{ route: ['dbLink'], kind: 'req', bounce: true, rate: 1.6 }]
      }
    },
    {
      short: 'Response Download',
      chapter: 'solution',
      title: 'Streaming the Response & Rendering',
      body: [
        'The web server serializes the rows into JSON or rendered HTML, compresses the payload with Gzip/Brotli, and streams the bytes back to the browser.',
        'The browser receives <code>200 OK</code>, parses the HTML DOM tree, kicks off CSS/JS downloads, and paints the initial screen.',
        'Total round-trip budget: 155 ms. <strong>130 ms of it was network waiting, while only 25 ms was compute!</strong>'
      ],
      callout: {
        kind: 'insight',
        text: 'Crucial lesson: High latency in distributed systems is almost always caused by network round trips and un-cached hops, rather than raw server compute.'
      },
      changes: ['+ Response 200 OK (38 KB)', '+ Total page budget: 155 ms'],
      metrics: { dns: 20, connect: 60, request: 50, download: 25, total: 155 },
      scene: {
        entities: {
          client: {
            x: 0,
            y: -12,
            color: 'sand',
            glyph: 'user',
            label: 'Browser',
            tags: [{ text: '200 OK Rendered', tone: 'green' }]
          },
          server: {
            x: 10,
            y: 0,
            color: 'blue',
            glyph: 'server',
            label: 'Web Server',
            cpu: 0.15
          },
          db: {
            x: 10,
            y: 12,
            type: 'db',
            color: 'violet',
            glyph: 'database',
            label: 'PostgreSQL'
          }
        },
        links: {
          resLink: {
            pts: [[10, -2], [0, -10]],
            heads: 'end',
            color: '#2f8a43',
            label: 'HTTP/2 Response (Brotli)'
          },
          dbLink: {
            pts: [[10, 2], [10, 10]],
            heads: 'none',
            color: '#ddd3c5'
          }
        },
        flows: [{ route: ['resLink'], kind: 'res', bounce: false, rate: 1.3 }]
      }
    }
  ]
};

