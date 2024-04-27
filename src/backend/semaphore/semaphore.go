package semaphore

// import (
// 	"fmt"
// 	"sync"
// )


type Semaphore struct {
    sem chan struct{}
    // wg  sync.WaitGroup
}

func NewSemaphore(maxWorkers int) *Semaphore {
    return &Semaphore{
        sem: make(chan struct{}, maxWorkers),
    }
}

func (s *Semaphore) Acquire() {
    s.sem <- struct{}{}
    // s.wg.Add(1)
}

func (s *Semaphore) Release() {
    <-s.sem
    // s.wg.Done()
}

// func (s *Semaphore) Wait() {
//     fmt.Printf("The waiting length is %d\n", len(s.sem))
//     // s.wg.Wait()
// }
