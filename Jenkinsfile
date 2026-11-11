
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    parameters {
        choice(
            name: 'DEPLOY_MODE',
            choices: ['dev', 'staging', 'production'],
            description: 'Pilih environment deployment'
        )
    }

    environment {
        DOCKER_IMAGE = 'my-frontend'
    }

    stages {

        stage('Configure Environment') {
            steps {
                script {
                    switch (params.DEPLOY_MODE) {
                        case 'dev':
                            env.GIT_BRANCH_NAME = 'dev'
                            env.CONTAINER_NAME = 'my-frontend-dev'
                            env.HOST_PORT = '3003'
                            break

                        case 'staging':
                            env.GIT_BRANCH_NAME = 'staging'
                            env.CONTAINER_NAME = 'my-frontend-staging'
                            env.HOST_PORT = '3004'
                            break

                        case 'production':
                            env.GIT_BRANCH_NAME = 'main'
                            env.CONTAINER_NAME = 'my-frontend-production'
                            env.HOST_PORT = '3000'
                            break

                        default:
                            error("Environment tidak valid")
                    }

                    env.IMAGE_TAG = "${params.DEPLOY_MODE}-${BUILD_NUMBER}"

                    echo "================================"
                    echo "Environment : ${params.DEPLOY_MODE}"
                    echo "Branch      : ${GIT_BRANCH_NAME}"
                    echo "Container   : ${CONTAINER_NAME}"
                    echo "Port        : ${HOST_PORT}"
                    echo "Image       : ${IMAGE_TAG}"
                    echo "================================"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[
                        name: "*/${GIT_BRANCH_NAME}"
                    ]],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build \
                      -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                      -t ${DOCKER_IMAGE}:${DEPLOY_MODE}-latest \
                      .
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                sh """
                    docker rm -f ${CONTAINER_NAME} || true
                """
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --restart unless-stopped \
                      -p ${HOST_PORT}:3000 \
                      ${DOCKER_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                    sleep 5

                    docker ps --filter name=${CONTAINER_NAME}

                    docker logs --tail 30 ${CONTAINER_NAME}
                """
            }
        }
    }

    post {
        success {
            echo "Deployment ${params.DEPLOY_MODE} berhasil!"
        }

        failure {
            echo "Deployment ${params.DEPLOY_MODE} gagal!"
        }

        always {
            echo "Pipeline selesai."
        }
    }
}
