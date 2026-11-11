
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        GIT_BRANCH = 'main'
        GIT_URL = 'https://github.com/MRamadhan000/jenskins-testing.git'
        CONFIG_CREDENTIAL_ID = 'FE_TEMPLATE_ENV'
    }

    stages {

        // ==========================================
        // CHECKOUT SOURCE CODE
        // ==========================================
        stage('Checkout Source Code') {
            steps {
                echo 'Checking out source code...'

                git branch: "${GIT_BRANCH}",
                    url: "${GIT_URL}"
            }
        }

        // ==========================================
        // VALIDATE CONFIGURATION
        // ==========================================
        stage('Validate Configuration') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${CONFIG_CREDENTIAL_ID}",
                        variable: 'CONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        echo "================================"
                        echo "Validating Configuration"
                        echo "================================"

                        if [ ! -f "$CONFIG_FILE" ]; then
                            echo "ERROR: Configuration file not found"
                            exit 1
                        fi

                        if [ ! -s "$CONFIG_FILE" ]; then
                            echo "ERROR: Configuration file is empty"
                            exit 1
                        fi

                        echo "Configuration file found"

                        echo "Checking shell syntax..."

                        if ! sh -n "$CONFIG_FILE"; then
                            echo "ERROR: Invalid shell syntax"
                            exit 1
                        fi

                        echo "Shell syntax is valid"

                        echo "Loading configuration..."

                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        # Required variables
                        : "${DOCKER_IMAGE_NAME:?Missing DOCKER_IMAGE_NAME}"
                        : "${DOCKER_IMAGE_TAG:?Missing DOCKER_IMAGE_TAG}"
                        : "${DOCKER_CONTAINER_NAME:?Missing DOCKER_CONTAINER_NAME}"
                        : "${DOCKER_PORT_HOST:?Missing DOCKER_PORT_HOST}"
                        : "${DOCKER_PORT_CONTAINER:?Missing DOCKER_PORT_CONTAINER}"
                        : "${NEXT_PUBLIC_BASE_PATH:?Missing NEXT_PUBLIC_BASE_PATH}"
                        : "${NEXT_PUBLIC_APP_NAME:?Missing NEXT_PUBLIC_APP_NAME}"

                        # Validate port numbers
                        case "$DOCKER_PORT_HOST:$DOCKER_PORT_CONTAINER" in
                            *[!0-9:]*|:*|*:)
                                echo "ERROR: Docker ports must be numeric"
                                exit 1
                                ;;
                        esac

                        if [ "$DOCKER_PORT_HOST" -lt 1 ] || [ "$DOCKER_PORT_HOST" -gt 65535 ] ||
                           [ "$DOCKER_PORT_CONTAINER" -lt 1 ] || [ "$DOCKER_PORT_CONTAINER" -gt 65535 ]; then
                            echo "ERROR: Docker port must be between 1 and 65535"
                            exit 1
                        fi

                        echo "All required variables are available"
                        echo "Docker image: $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
                        echo "Container: $DOCKER_CONTAINER_NAME"
                        echo "Host port: $DOCKER_PORT_HOST"
                        echo "Configuration validation successful"
                    '''
                }
            }
        }

        // ==========================================
        // CLEANUP OLD CONTAINER
        // ==========================================
        stage('Cleanup Old Container') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${CONFIG_CREDENTIAL_ID}",
                        variable: 'CONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "Checking existing container..."

                        if docker ps -aq --filter "name=^/${DOCKER_CONTAINER_NAME}$" | grep -q .; then
                            echo "Stopping old container..."

                            docker stop "$DOCKER_CONTAINER_NAME" || true

                            echo "Removing old container..."

                            docker rm "$DOCKER_CONTAINER_NAME" || true
                        else
                            echo "No existing container found"
                        fi

                        echo "Cleanup completed"
                    '''
                }
            }
        }

        // ==========================================
        // BUILD DOCKER IMAGE
        // ==========================================
        stage('Build Docker Image') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${CONFIG_CREDENTIAL_ID}",
                        variable: 'CONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "================================"
                        echo "Building Docker Image"
                        echo "================================"

                        docker build \
                            --build-arg "NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH" \
                            --build-arg "NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME" \
                            -t "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG" .

                        echo "Docker image built successfully"
                    '''
                }
            }
        }

        // ==========================================
        // DEPLOY CONTAINER
        // ==========================================
        stage('Deploy Container') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${CONFIG_CREDENTIAL_ID}",
                        variable: 'CONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "================================"
                        echo "Deploying Container"
                        echo "================================"

                        docker run -d \
                            --name "$DOCKER_CONTAINER_NAME" \
                            --restart unless-stopped \
                            -p "$DOCKER_PORT_HOST:$DOCKER_PORT_CONTAINER" \
                            "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"

                        echo "Container deployed successfully"
                    '''
                }
            }
        }

        // ==========================================
        // VERIFY DEPLOYMENT
        // ==========================================
        stage('Verify Deployment') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${CONFIG_CREDENTIAL_ID}",
                        variable: 'CONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        set -a
                        . "$CONFIG_FILE"
                        set +a

                        echo "================================"
                        echo "Verifying Deployment"
                        echo "================================"

                        sleep 5

                        if ! docker ps -q --filter "name=^/${DOCKER_CONTAINER_NAME}$" | grep -q .; then
                            echo "ERROR: Container is not running"

                            echo "Container logs:"
                            docker logs "$DOCKER_CONTAINER_NAME" || true

                            exit 1
                        fi

                        echo "Container is running"

                        docker ps \
                            --filter "name=^/${DOCKER_CONTAINER_NAME}$" \
                            --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

                        echo "Deployment verification successful"
                    '''
                }
            }
        }

        // ==========================================
        // PRUNE UNUSED IMAGES
        // ==========================================
        stage('Prune Unused Images') {
            steps {
                sh '''
                    set +x
                    set -eu

                    echo "Removing unused Docker images..."

                    docker image prune -f

                    echo "Docker image cleanup completed"
                '''
            }
        }
    }

    // ==========================================
    // POST ACTIONS
    // ==========================================
    post {

        success {
            echo 'Deployment successful!'

            withCredentials([
                file(
                    credentialsId: "${CONFIG_CREDENTIAL_ID}",
                    variable: 'CONFIG_FILE'
                )
            ]) {
                sh '''
                    set +x
                    set -eu

                    set -a
                    . "$CONFIG_FILE"
                    set +a

                    echo "================================"
                    echo "DEPLOYMENT SUCCESSFUL"
                    echo "================================"

                    echo "Application URL:"
                    echo "http://localhost:$DOCKER_PORT_HOST$NEXT_PUBLIC_BASE_PATH"
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
