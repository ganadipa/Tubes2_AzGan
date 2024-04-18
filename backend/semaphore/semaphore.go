package semaphore

import (
	"sync"
)


type semaphore struct {
    sem chan struct{}
    wg  sync.WaitGroup
}

func NewSemaphore(maxWorkers int) *semaphore {
    return &semaphore{
        sem: make(chan struct{}, maxWorkers),
    }
}

func (s *semaphore) Acquire() {
    s.sem <- struct{}{}
    s.wg.Add(1)
}

func (s *semaphore) Release() {
    <-s.sem
    s.wg.Done()
}

func (s *semaphore) Wait() {
    s.wg.Wait()
}
