#!/bin/bash

# Open a new terminal and run the backend server
gnome-terminal -- bash -c "cd backend; go run server.go; exec bash"

# Open another new terminal and run the frontend
gnome-terminal -- bash -c "cd frontend; npm run start; exec bash"
