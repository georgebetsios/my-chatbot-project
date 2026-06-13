# Intelligent Dialogue System for Post-Graduate Program Inquiries

An automated, bilingual digital assistant built to streamline information delivery for prospective applicants of the MSc in "Technologies of Interactive Systems" at the Aristotle University of Thessaloniki. 

The architecture links a decoupled frontend web layer with an AI-driven conversational engine through a stateful API workflow.

---

## Architecture Overview

This production repository partitions the system layout into two independent micro-architectures:
1. **`/rasa-frontend`**: A React single-page application built on top of the Vite build tool, featuring a dynamic chat client with custom markdown and SVG quick-reply support.
2. **`/rasa-backend`**: An NLP backend deployment using Rasa Open Source for entity extraction, intent classification, and state management, alongside a Python Rasa SDK webhook for custom programmatic actions.

---

## Deploying the AI Core Backend

All commands outlined below must be executed from within the `/rasa-backend` project root directory.

### Environment Virtualization & Dependency Setup

1. Run the following command to create a virtual environment:
    ```
        python3 -m venv ./venv
    ```

2. Engage the virtualization environment:
    ```
        source ./venv/bin/activate
    ```

3. Upgrade the package manager and compile the core Rasa package:
    ```
        pip install --upgrade pip
        pip install rasa
    ```

### Server Initialisation & Integration Runtime

1. Compile and optimize the conversational pipeline vectors by training the model structure:
    
    ```
        rasa train
    ```

2. Once compiled, spin up the natural language core engine, opening the REST network channel and unlocking cross-origin traffic policies:

    ```
        rasa run --enable-api --cors="*"
    ```

    The central NLU pipeline exposes its endpoint network natively at [http://localhost:5005](http://localhost:5005).

3. Simultaneously, host the secondary Python SDK environment to handle real-time programmatic features (such as language fallback overrides):

    ```
        rasa run actions
    ```

    This event listener triggers automatically on port 5055.

## UI Web Deployment

The interaction module is an asynchronous web wrapper built with React to process user inputs, render rich-text Markdown links, and display proactive options buttons.

### Executing the Web Client:

1. Navigate your terminal environment into the `/rasa-frontend` distribution folder and run the installation script to bundle necessary dependencies:
    
    ```
        npm install
    ```

2. Launch the local development asset compiler:
    
    ```
        npm run dev 
    ```

    The conversational client workspace will instantly map and become active inside the browser engine at http://localhost:5173.
