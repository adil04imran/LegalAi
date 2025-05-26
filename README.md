# LegalAi

# Full Project Suite

## Overview

This repository contains three interconnected projects:

- **Main page**: A landing page with two buttons.
  - **Button 1** redirects to **lextract-main-2**
  - **Button 2** redirects to **second-mind-main-2**
- **lextract-main-2**: A web application that serves as the first target of the Main page.
- **second-mind-main-2**: A web application that serves as the second target of the Main page.

All three projects are containerized and managed via Docker Compose.

---

## Folder Structure

Start all services using docker
docker-compose up --build

**Access the projects**

    Main page: http://localhost:3000
    lextract-main-2: http://localhost:3001
    second-mind-main-2: http://localhost:3002
    
**Note**

Ensure that your button links in the Main page point to the correct ports:

http://localhost:3001 for lextract-main-2

http://localhost:3002 for second-mind-main-2


If ports are already in use, you can modify them in the docker-compose.yml file.

**Shutting Down**

To stop the containers, run:

docker-compose down