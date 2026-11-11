
pipeline {
    agent any

    stages {

        stage('Checkout Source Code') {
            steps {
                echo 'Checkout source code...'

                git branch: 'main',
                    url: 'https://github.com/MRamadhan000/jenskins-testing.git'
            }
        }

        stage('Validate Configuration') {
            steps {
                withCredentials([
                    file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
                ]) {
                    sh '''
                        set -eu

                        if [ ! -f "$CONFIG_FILE" ]; then
                            echo "ERROR: Configuration file not found"
                            exit 1
                        fi

                        echo "Configuration file found successfully"
                    '''
                }
            }
        }

        stage('Cleanup Old Container') {
            steps {
                withCredentials([
                    file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
                ]) {
                    sh '''
                        set -eu
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
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
                ]) {
                    sh '''
                        set -eu
                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "Building Docker image..."

                        docker build \
                          --build-arg "NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH" \
                          --build-arg "NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME" \
                          -t "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG" .
                    '''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([
                    file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
                ]) {
                    sh '''
                        set -eu
                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "Deploying container..."

                        docker run -d \
                          --name "$DOCKER_CONTAINER_NAME" \
                          --restart unless-stopped \
                          -p "$DOCKER_PORT_HOST:$DOCKER_PORT_CONTAINER" \
                          "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([
                    file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
                ]) {
                    sh '''
                        set -eu
                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        docker ps \
                          --filter "name=^/${DOCKER_CONTAINER_NAME}$" \
                          --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                    '''
                }
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

            withCredentials([
                file(credentialsId: 'FE_TEMPLATE_ENV', variable: 'CONFIG_FILE')
            ]) {
                sh '''
                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    echo "Application URL: http://localhost:$DOCKER_PORT_HOST$NEXT_PUBLIC_BASE_PATH"
                '''
            }
        }

        failure {
            echo 'Deployment failed. Check Jenkins Console Output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
