curl -X POST http://localhost:8000/ \
     -H "Content-Type: application/json" \
     -d '{"source": "Chicken", "target": "Duck", "using_bfs": true}'
