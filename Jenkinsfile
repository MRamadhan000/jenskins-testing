
pipeline {
    agent any

    environment {
        // Docker Configuration
        IMAGE_NAME     = credentials('DOCKER_IMAGE_NAME_FE_TEMPLATE')
        IMAGE_TAG      = credentials('DOCKER_IMAGE_TAG_FE_TEMPLATE')
        CONTAINER_NAME = credentials('DOCKER_CONTAINER_NAME_FE_TEMPLATE')

        // Port Configuration
        PORT_HOST      = credentials('DOCKER_PORT_HOST_FE_TEMPLATE')
        PORT_CONTAINER = credentials('DOCKER_PORT_CONTAINER_FE_TEMPLATE')

        // Next.js Configuration
        NEXT_PUBLIC_BASE_PATH = credentials('NEXT_PUBLIC_BASE_PATH_FE_TEMPLATE')
        NEXT_PUBLIC_APP_NAME  = credentials('NEXT_PUBLIC_APP_NAME_FE_TEMPLATE')
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo 'Checkout source code...'

                git branch: 'main',
                    url: 'https://github.com/MRamadhan000/jenskins-testing.git'
            }
        }

        stage('Cleanup Old Container') {
            steps {
                echo 'Cleaning up old container...'

                sh '''
                    if docker ps -aq -f name="^${CONTAINER_NAME}$" | grep -q .; then
                        docker stop "${CONTAINER_NAME}" || true
                        docker rm "${CONTAINER_NAME}" || true
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'

                sh '''
                    docker build \
                      --build-arg NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH}" \
                      --build-arg NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME}" \
                      -t "${IMAGE_NAME}:${IMAGE_TAG}" .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying Next.js application...'

                sh '''
                    docker run -d \
                      --name "${CONTAINER_NAME}" \
                      --restart unless-stopped \
                      -p "${PORT_HOST}:${PORT_CONTAINER}" \
                      "${IMAGE_NAME}:${IMAGE_TAG}"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Checking container status...'

                sh '''
                    docker ps \
                      --filter "name=^${CONTAINER_NAME}$" \
                      --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                '''
            }
        }

        stage('Prune Unused Images') {
            steps {
                echo 'Cleaning dangling Docker images...'

                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
            echo "Application: http://localhost:${PORT_HOST}${NEXT_PUBLIC_BASE_PATH}"
        }

        failure {
            echo 'Deployment failed. Check Jenkins Console Output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
