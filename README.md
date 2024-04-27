# Tugas Besar Strategi Algoritma AzGan
## Description
Wikirace is a game that challenges players to find the shortest path between two Wikipedia articles by only clicking the hyperlinks within the articles. In this version of the game, we use two search algorithms: Breadth-First Search (BFS) and Iterative Deepening Search (IDS).

## Algorithms

### Breadth-First Search (BFS)
BFS is a simple strategy in which the root node is expanded first, then all the successors of the root node are expanded next, and then their successors, and so on. In general, all nodes are expanded at a given depth in the search tree before any nodes at the next level are expanded.

### Iterative Deepening Search (IDS)
IDS is a state space/graph search strategy in which a depth-limited version of depth-first search is run repeatedly with increasing depth limits until the goal is found. IDS is optimal like breadth-first search, but uses much less memory.

## Requirements
Docker must be installed in order to run this program.

## How to run
1. Clone this repo
 ```bash
 git clone https://github.com/ganadipa/Tubes2_AzGan.git
 ```

2. Navigate to `Tubes2_FE_AzmiKerenAbis/src` directory

  ```bash
  cd Tubes2_FE_AzmiKerenAbis/src
  ``` 


3. Make sure docker is on and type this in your terminal
```
docker compose up
```
4. Open your browser and go to ```localhost:3000 ```

## Contributors
| Name | NIM | Class |
| ---- | -------- | ----- |
|Muhammad Al Thariq Fairuz|13522027|K01|
|Nyoman Ganadipa Narayana|13522066|K02|
|Azmi Mahmud Bazeid|13522109|K01|


