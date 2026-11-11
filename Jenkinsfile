pipeline {
    agent any

    environment {
        IMAGE_NAME     = 'my-frontend'
        IMAGE_TAG      = 'latest'
        CONTAINER_NAME = 'my-frontend'
        PORT_HOST      = '3000'
        PORT_CONTAINER = '3000'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo 'Mengunduh repository dari GitHub...'
                git branch: 'main', url: 'https://github.com/MRamadhan000/jenskins-testing.git'
            }
        }

        stage('Cleanup Container Lama') {
            steps {
                echo 'Menghentikan container lama jika sedang berjalan...'
                sh '''
                    if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
                        echo "Menghentikan dan menghapus container ${CONTAINER_NAME}..."
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    fi
                '''
            }
        }

        stage('Build Docker Image (Opsi Aman)') {
            steps {
                echo 'Memulai proses Docker Build dengan variabel aman...'
                // Mengambil nilai rahasia dari Jenkins Credentials secara aman
                withCredentials([
                    string(credentialsId: 'NEXT_PUBLIC_BASE_PATH_CRED', variable: 'BASE_PATH_VAL'),
                    string(credentialsId: 'NEXT_PUBLIC_APP_NAME_CRED', variable: 'APP_NAME_VAL')
                ]) {
                    sh '''
                        docker build \
                          --build-arg NEXT_PUBLIC_BASE_PATH="${BASE_PATH_VAL}" \
                          --build-arg NEXT_PUBLIC_APP_NAME="${APP_NAME_VAL}" \
                          -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    '''
                }
            }
        }

        stage('Deploy / Run Container') {
            steps {
                echo 'Menjalankan container Next.js baru...'
                sh '''
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --restart unless-stopped \
                      -p ${PORT_HOST}:${PORT_CONTAINER} \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Prune Unused Images') {
            steps {
                echo 'Membersihkan image menggantung (dangling images)...'
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo "Deployment berhasil! Aplikasi berjalan di http://localhost:${PORT_HOST}"
        }
        failure {
            echo 'Deployment gagal. Silakan cek logConsole Output.'
        }
    }
}