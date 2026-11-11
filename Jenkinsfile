
pipeline {
    agent any

    environment {
        // Project Configuration File
        CONFIG_FILE = credentials('FE_TEMPLATE_ENV')
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                echo 'Checkout source code...'

                git branch: 'main',
                    url: 'https://github.com/MRamadhan000/jenskins-testing.git'
            }
        }

        stage('Load Configuration') {
            steps {
                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    echo "Configuration loaded successfully"
                    echo "Docker image: $DOCKER_IMAGE_NAME"
                    echo "Container: $DOCKER_CONTAINER_NAME"
                '''
            }
        }

        stage('Cleanup Old Container') {
            steps {
                echo 'Cleaning up old container...'

                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    if docker ps -aq --filter "name=^/${DOCKER_CONTAINER_NAME}$" | grep -q .; then
                        docker stop "$DOCKER_CONTAINER_NAME" || true
                        docker rm "$DOCKER_CONTAINER_NAME" || true
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'

                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    docker build \
                      --build-arg NEXT_PUBLIC_BASE_PATH="$NEXT_PUBLIC_BASE_PATH" \
                      --build-arg NEXT_PUBLIC_APP_NAME="$NEXT_PUBLIC_APP_NAME" \
                      -t "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG" .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying Next.js application...'

                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    docker run -d \
                      --name "$DOCKER_CONTAINER_NAME" \
                      --restart unless-stopped \
                      -p "$DOCKER_PORT_HOST:$DOCKER_PORT_CONTAINER" \
                      "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    docker ps \
                      --filter "name=^/${DOCKER_CONTAINER_NAME}$" \
                      --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                '''
            }
        }

        stage('Prune Unused Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'

            sh '''
                set -a
                . "$CONFIG_FILE"
                set +a

                echo "Application URL: http://localhost:$DOCKER_PORT_HOST$NEXT_PUBLIC_BASE_PATH"
            '''
        }

        failure {
            echo 'Deployment failed. Check Jenkins Console Output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
