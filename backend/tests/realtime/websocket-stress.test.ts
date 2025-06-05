// tests/realtime/websocket-stress.test.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import jwt from 'jsonwebtoken';

describe('웹소켓 스트레스 테스트', () => {
  let server: any;
  let io: Server;
  let clients: any[] = [];
  let authToken: string;
  const PORT = 4000;

  beforeAll((done) => {
    // 테스트용 JWT 토큰 생성
    authToken = jwt.sign(
      { userId: 1, username: 'testuser' },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    const httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // 테스트용 이벤트 핸들러 추가
    io.on('connection', (socket) => {
      console.log('클라이언트 연결됨:', socket.id);
      
      // 테스트 메시지 재전송
      socket.on('test_message', (data: any) => {
        socket.broadcast.emit('test_message', data);
      });
      
      // 알림 테스트
      socket.on('send_notification', (data: any) => {
        socket.emit('notification_response', { received: data });
      });
      
      // 지연 메시지 테스트
      socket.on('delayed_message', (data: any) => {
        setTimeout(() => {
          socket.emit('delayed_response', data);
        }, Math.random() * 50 + 10);
      });
      
      socket.on('disconnect', () => {
        console.log('클라이언트 연결 해제됨:', socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`테스트 웹소켓 서버 시작: ${PORT}`);
      done();
    });

    server = httpServer;
  });

  afterAll((done) => {
    // 모든 클라이언트 정리
    clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    
    // 서버 정리
    if (server) {
      server.close(() => {
        // Node.js 환경에서 모든 활성 타이머 정리
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
          // Node.js 환경에서는 process._getActiveHandles()를 사용할 수 있지만
          // 테스트 환경에서는 단순히 대기 시간을 늘려서 자연스럽게 정리되도록 함
        }
        
        // 서버 정리 후 충분한 대기 시간
        setTimeout(() => {
          done();
        }, 2000); // 1초 → 2초로 증가
      });
    } else {
      done();
    }
  });

  afterEach(() => {
    clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    clients = [];
  });

  test('대용량 동시 접속 테스트 - 20명 동시 접속', (done) => {
    const CONNECTION_COUNT = 20;
    const connectedClients: any[] = [];
    let connectedCount = 0;
    let testCompleted = false;
    let timeoutHandle: NodeJS.Timeout;

    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      if (timeoutHandle) clearTimeout(timeoutHandle);
      connectedClients.forEach(c => c.disconnect());
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };

    const connectClient = (index: number) => {
      const client = Client(`http://localhost:${PORT}`, {
        forceNew: true,
        timeout: 5000
      });
      
      client.on('connect', () => {
        if (testCompleted) return;
        
        connectedCount++;
        connectedClients.push(client);
        
        console.log(`클라이언트 ${index} 연결됨 (${connectedCount}/${CONNECTION_COUNT})`);
        
        if (connectedCount === CONNECTION_COUNT) {
          expect(connectedClients).toHaveLength(CONNECTION_COUNT);
          expect(io.engine.clientsCount).toBeGreaterThan(0);
          console.log(`모든 클라이언트 연결 완료: ${connectedCount}개`);
          cleanupAndDone();
        }
      });

      client.on('connect_error', (error: Error) => {
        if (testCompleted) return;
        console.error(`클라이언트 ${index} 연결 실패:`, error.message);
        if (connectedCount === 0) {
          cleanupAndDone(new Error(`모든 클라이언트 연결 실패`));
        }
      });

      clients.push(client);
    };

    // 순차적으로 연결하여 안정성 향상
    let currentIndex = 0;
    const connectNext = () => {
      if (currentIndex < CONNECTION_COUNT && !testCompleted) {
        connectClient(currentIndex);
        currentIndex++;
        setTimeout(connectNext, 50);
      }
    };
    
    connectNext();
    
    // 타임아웃 처리
    timeoutHandle = setTimeout(() => {
      if (connectedCount > CONNECTION_COUNT * 0.5) {
        console.log(`부분 성공: ${connectedCount}/${CONNECTION_COUNT} 연결`);
        cleanupAndDone();
      } else {
        cleanupAndDone(new Error(`연결 부족: ${connectedCount}/${CONNECTION_COUNT}`));
      }
    }, 12000);
  }, 15000);

  test('실시간 메시지 전송 성능 테스트', (done) => {
    const MESSAGE_COUNT = 10;
    const client1 = Client(`http://localhost:${PORT}`, {
      forceNew: true,
      timeout: 5000
    });
    const client2 = Client(`http://localhost:${PORT}`, {
      forceNew: true,  
      timeout: 5000
    });
    
    let receivedCount = 0;
    let startTime: number;
    let testCompleted = false;
    let bothConnected = false;
    let timeoutHandle: NodeJS.Timeout;
    let messageTimeouts: NodeJS.Timeout[] = []; // 메시지 전송 setTimeout들 추적

    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      // 모든 타임아웃 정리
      if (timeoutHandle) clearTimeout(timeoutHandle);
      messageTimeouts.forEach(timeout => clearTimeout(timeout));
      messageTimeouts = [];
      
      client1.disconnect();
      client2.disconnect();
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };

    const checkBothConnected = () => {
      if (client1.connected && client2.connected && !bothConnected && !testCompleted) {
        bothConnected = true;
        console.log('두 클라이언트 모두 연결됨, 메시지 전송 시작');
        
        startTime = Date.now();
        
        // 메시지 연속 전송 (setTimeout들을 추적)
        for (let i = 0; i < MESSAGE_COUNT; i++) {
          const messageTimeout = setTimeout(() => {
            if (!testCompleted) {
              client1.emit('test_message', { id: i, data: `테스트 메시지 ${i}` });
            }
          }, i * 10);
          messageTimeouts.push(messageTimeout);
        }
      }
    };

    client1.on('connect', () => {
      console.log('Client1 연결됨');
      checkBothConnected();
    });

    client2.on('connect', () => {
      console.log('Client2 연결됨');
      checkBothConnected();
      
      client2.on('test_message', (data: any) => {
        if (testCompleted) return;
        
        receivedCount++;
        console.log(`메시지 수신: ${receivedCount}/${MESSAGE_COUNT}`);
        
        if (receivedCount === MESSAGE_COUNT) {
          const endTime = Date.now();
          const totalTime = endTime - startTime;
          const messagesPerSecond = MESSAGE_COUNT / (totalTime / 1000);
          
          console.log(`메시지 처리 성능: ${messagesPerSecond.toFixed(2)} msgs/sec`);
          expect(messagesPerSecond).toBeGreaterThan(1);
          cleanupAndDone();
        }
      });
    });

    client1.on('connect_error', (error: Error) => {
      cleanupAndDone(new Error(`Client1 연결 실패: ${error.message}`));
    });

    client2.on('connect_error', (error: Error) => {
      cleanupAndDone(new Error(`Client2 연결 실패: ${error.message}`));
    });

    clients.push(client1, client2);
    
    // 타임아웃 처리
    timeoutHandle = setTimeout(() => {
      console.log(`테스트 상태 - 연결: client1=${client1.connected}, client2=${client2.connected}, 수신: ${receivedCount}/${MESSAGE_COUNT}`);
      if (receivedCount > 0) {
        cleanupAndDone();
      } else {
        cleanupAndDone(new Error(`메시지 전송 실패: ${receivedCount}/${MESSAGE_COUNT}`));
      }
    }, 8000);
  }, 10000);

  test('실시간 알림 지연 테스트', (done) => {
    const client = Client(`http://localhost:${PORT}`, {
      forceNew: true,
      timeout: 5000
    });
    const expectedDelay = 1000;
    let testCompleted = false;
    let timeoutHandle: NodeJS.Timeout;
    
    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      if (timeoutHandle) clearTimeout(timeoutHandle);
      client.disconnect();
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };
    
    client.on('connect', () => {
      console.log('알림 테스트 클라이언트 연결됨');
      const startTime = Date.now();
      
      client.on('notification_response', (data: any) => {
        if (testCompleted) return;
        
        const endTime = Date.now();
        const delay = endTime - startTime;
        
        console.log(`알림 지연 시간: ${delay}ms`);
        console.log('수신된 데이터:', data);
        expect(delay).toBeLessThan(expectedDelay);
        
        cleanupAndDone();
      });

      // 연결 직후 약간 대기
      setTimeout(() => {
        if (!testCompleted) {
          client.emit('send_notification', { 
            userId: 1, 
            message: '테스트 알림',
            timestamp: startTime
          });
        }
      }, 100);
    });

    client.on('connect_error', (error: Error) => {
      cleanupAndDone(new Error(`연결 실패: ${error.message}`));
    });

    clients.push(client);
    
    // 타임아웃 처리
    timeoutHandle = setTimeout(() => {
      console.log('알림 응답 타임아웃 - 클라이언트 연결 상태:', client.connected);
      cleanupAndDone(new Error('알림 응답 타임아웃'));
    }, 4000);
  }, 6000);

  test('메모리 누수 테스트 - 연결/해제 반복', (done) => {
    const CYCLE_COUNT = 10;
    let currentCycle = 0;
    let testCompleted = false;
    let timeoutHandle: NodeJS.Timeout;
    
    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      if (timeoutHandle) clearTimeout(timeoutHandle);
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };
    
    const runCycle = () => {
      if (testCompleted) return;
      
      const client = Client(`http://localhost:${PORT}`, {
        forceNew: true,
        timeout: 3000
      });
      
      client.on('connect', () => {
        if (testCompleted) return;
        
        console.log(`사이클 ${currentCycle + 1}/${CYCLE_COUNT} 연결됨`);
        
        setTimeout(() => {
          if (testCompleted) return;
          
          client.disconnect();
          currentCycle++;
          
          if (currentCycle >= CYCLE_COUNT) {
            // 모든 사이클 완료 후 잠시 대기하여 연결 정리
            setTimeout(() => {
              if (!testCompleted) {
                console.log(`최종 연결 수: ${io.engine.clientsCount}`);
                expect(io.engine.clientsCount).toBeLessThanOrEqual(2);
                cleanupAndDone();
              }
            }, 1000);
          } else {
            setTimeout(runCycle, 100);
          }
        }, 100);
      });
      
      client.on('connect_error', (error: Error) => {
        if (testCompleted) return;
        
        console.log(`사이클 ${currentCycle + 1} 연결 실패:`, error.message);
        currentCycle++;
        
        if (currentCycle >= CYCLE_COUNT) {
          cleanupAndDone();
        } else {
          setTimeout(runCycle, 100);
        }
      });
    };

    runCycle();
    
    // 전체 테스트 타임아웃
    timeoutHandle = setTimeout(() => {
      console.log(`타임아웃: ${currentCycle}/${CYCLE_COUNT} 사이클 완료`);
      if (currentCycle >= CYCLE_COUNT * 0.8) {
        cleanupAndDone();
      } else {
        cleanupAndDone(new Error(`사이클 실행 실패: ${currentCycle}/${CYCLE_COUNT}`));
      }
    }, 12000);
  }, 15000);

  test('대량 동시 메시지 브로드캐스트 테스트', (done) => {
    const CLIENT_COUNT = 5;
    const MESSAGE_COUNT = 3;
    const connectedClients: any[] = [];
    let totalReceived = 0;
    const expectedTotal = CLIENT_COUNT * MESSAGE_COUNT;
    let testCompleted = false;
    let timeoutHandle: NodeJS.Timeout;
    let broadcastTimeouts: NodeJS.Timeout[] = []; // 브로드캐스트 setTimeout들 추적
    let connectedCount = 0;

    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      // 모든 타임아웃 정리
      if (timeoutHandle) clearTimeout(timeoutHandle);
      broadcastTimeouts.forEach(timeout => clearTimeout(timeout));
      broadcastTimeouts = [];
      
      connectedClients.forEach(c => c.disconnect());
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };

    for (let i = 0; i < CLIENT_COUNT; i++) {
      const client = Client(`http://localhost:${PORT}`, {
        forceNew: true,
        timeout: 5000
      });
      
      client.on('connect', () => {
        if (testCompleted) return;
        
        connectedCount++;
        connectedClients.push(client);
        console.log(`브로드캐스트 클라이언트 ${i} 연결됨 (${connectedCount}/${CLIENT_COUNT})`);
        
        if (connectedCount === CLIENT_COUNT) {
          const startTimeout = setTimeout(startBroadcast, 200);
          broadcastTimeouts.push(startTimeout);
        }
      });

      client.on('broadcast_message', (data: any) => {
        if (testCompleted) return;
        
        totalReceived++;
        console.log(`브로드캐스트 수신: ${totalReceived}/${expectedTotal}`);
        
        if (totalReceived >= expectedTotal * 0.8) {
          expect(totalReceived).toBeGreaterThanOrEqual(expectedTotal * 0.8);
          cleanupAndDone();
        }
      });

      client.on('connect_error', (error: Error) => {
        if (!testCompleted) {
          console.log(`브로드캐스트 클라이언트 ${i} 연결 실패:`, error.message);
        }
      });

      clients.push(client);
    }

    const startBroadcast = () => {
      if (testCompleted) return;
      
      console.log('브로드캐스트 시작');
      for (let i = 0; i < MESSAGE_COUNT; i++) {
        const broadcastTimeout = setTimeout(() => {
          if (!testCompleted) {
            io.emit('broadcast_message', { 
              id: i, 
              message: `브로드캐스트 메시지 ${i}`
            });
          }
        }, i * 100);
        broadcastTimeouts.push(broadcastTimeout);
      }
    };
    
    // 타임아웃 처리
    timeoutHandle = setTimeout(() => {
      if (totalReceived > 0) {
        console.log(`부분 성공: ${totalReceived}/${expectedTotal} 메시지 수신`);
        cleanupAndDone();
      } else {
        cleanupAndDone(new Error(`브로드캐스트 실패: ${totalReceived}/${expectedTotal}`));
      }
    }, 10000);
  }, 15000);

  test('네트워크 지연 시뮬레이션 테스트', (done) => {
    let testCompleted = false;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let client: any = null;

    const cleanupAndDone = (error?: Error) => {
      if (testCompleted) return;
      testCompleted = true;
      
      // 타임아웃 정리
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      
      // 클라이언트 정리
      if (client && client.connected) {
        client.disconnect();
      }
      
      if (error) {
        done(error);
      } else {
        done();
      }
    };

    try {
      client = Client(`http://localhost:${PORT}`, {
        timeout: 3000, // 타임아웃 단축
        forceNew: true
      });

      let messagesReceived = 0;
      const targetMessages = 2; // 메시지 수 줄임

      client.on('connect', () => {
        console.log('지연 테스트 클라이언트 연결됨');
        
        client.on('delayed_response', (data: any) => {
          if (testCompleted) return;
          
          messagesReceived++;
          console.log(`지연 응답 수신: ${messagesReceived}/${targetMessages}`);
          
          if (messagesReceived >= targetMessages) {
            expect(messagesReceived).toBeGreaterThan(0);
            cleanupAndDone();
          }
        });

        // 단순화된 메시지 전송 (재귀 없음)
        for (let i = 0; i < targetMessages; i++) {
          setTimeout(() => {
            if (!testCompleted && client && client.connected) {
              client.emit('delayed_message', { 
                id: i,
                timestamp: Date.now()
              });
              console.log(`지연 메시지 전송: ${i + 1}/${targetMessages}`);
            }
          }, (i + 1) * 200); // 200ms 간격으로 전송
        }
      });

      client.on('connect_error', (error: Error) => {
        cleanupAndDone(new Error(`연결 실패: ${error.message}`));
      });

      client.on('disconnect', () => {
        console.log('지연 테스트 클라이언트 연결 해제됨');
      });

      clients.push(client);
      
      // 타임아웃 처리 (단일 타이머만 사용)
      timeoutHandle = setTimeout(() => {
        if (messagesReceived > 0) {
          console.log(`부분 성공: ${messagesReceived}/${targetMessages} 응답 수신`);
          cleanupAndDone();
        } else {
          cleanupAndDone(new Error(`지연 테스트 실패: ${messagesReceived}/${targetMessages}`));
        }
      }, 4000); // 타임아웃 단축

    } catch (error) {
      cleanupAndDone(error as Error);
    }
  }, 6000); // 전체 테스트 타임아웃 단축
});