#!/usr/bin/env groovy

props = null
IMAGE_VERSION = null
PROJECT_NAME = null
deployToDev = true
deployToStaging = true
deployToProd = true

def loadProperties() {
    node {
        checkout scm
        props = readProperties file: "pipeline.properties"
        IMAGE_REGISTRY = props.IMAGE_REGISTRY
        PROJECT_NAME = props.PROJECT_NAME
        IMAGE_VERSION = props.IMAGE_VERSION + "-$BUILD_NUMBER"
    }
}

pipeline {
    agent any
    stages {
        stage('Prepare') {
            steps {
                script {
                    loadProperties()
                }
            }
        }
        stage('Unit Test') {
            steps {
                sh """
                    echo "Mock testing Reactjs..."
                """

            }
        }
        stage('Build Image') {
            steps {
                sh """
                    docker build . -t ${IMAGE_REGISTRY}/${PROJECT_NAME}:${IMAGE_VERSION}
                    docker save ${IMAGE_REGISTRY}/${PROJECT_NAME}:${IMAGE_VERSION} --output build_image.tar
                """
                stash includes: 'build_image.tar', name: 'build_image'
            }
        }
        stage('Scan Image with Trivy') {
            steps {
                unstash 'build_image'
                sh """
                    trivy image --input build_image.tar --severity HIGH,MEDIUM
                """
            }
        }

        stage('Push Image') {
            steps {
                unstash 'build_image'
                withCredentials([usernamePassword(credentialsId: 'docker_id', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'docker login --username $USERNAME --password $PASSWORD'  
                }
                sh """
                    docker load --input build_image.tar
                    docker push ${IMAGE_REGISTRY}/${PROJECT_NAME}:${IMAGE_VERSION}
                    docker rmi ${IMAGE_REGISTRY}/${PROJECT_NAME}:${IMAGE_VERSION}
                """
            }
        }

        stage('Build Kubernetes Manifest') {
            steps {
                sh "sed -i \"s/version:.*/version: ${IMAGE_VERSION}/g\" \$(find . -name \"Chart.yaml\")"
                sh "helm template src/helm/${PROJECT_NAME} > manifest.yaml"
                stash includes: 'manifest.yaml', name: 'manifest'
            }
        }
        stage ('Deploy to Cluster') {
            parallel {
                stage('Deploy to Dev Cluster') {
                    steps {
                        script {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                try {
                                    resp = input id: 'deploy-dev', message:
                                    'Proceed to deploy in dev cluster?', submitterParameter: 'approver'
                                }
                                catch(e) {
                                    error("This stage was rejected by ${resp}")
                                }
                                withCredentials([string(credentialsId: 'kubeconfig_dev', variable: 'SECRET')]) {
                                    unstash 'manifest'
                                    sh '''
                                        kubectl apply -f manifest.yaml --kubeconfig=$SECRET
                                    '''
                                }
                            }
                        }
                    }
                }
                stage('Deploy to Staging Cluster') {
                    when {
                        expression { env.BRANCH_NAME ==~ '^(test/|release/).*$' }
                    }
                    steps {
                        script {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                try {
                                    resp = input id: 'deploy-staging', message:
                                    'Proceed to deploy in staging cluster?', submitterParameter: 'approver'
                                }
                                catch(e) {
                                    error("This stage was rejected by ${resp}")
                                }
                                withCredentials([string(credentialsId: 'kubeconfig_staging', variable: 'SECRET')]) {
                                    unstash 'manifest'
                                    sh '''
                                        kubectl apply -f manifest.yaml --kubeconfig=$SECRET
                                    '''
                                }
                            }
                        }
                    }
                }
                stage('Deploy to Production Cluster') {
                    when {
                        branch '^(prod.*|master)$'
                    }
                    steps {
                        script {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                try {
                                    resp = input id: 'deploy-prod', message:
                                    'Proceed to deploy in production cluster?', submitterParameter: 'approver'
                                }
                                catch(e) {
                                    error("This stage was rejected by ${resp}")
                                }
                                withCredentials([string(credentialsId: 'kubeconfig_prod', variable: 'SECRET')]) {
                                    unstash 'manifest'
                                    sh '''
                                        kubectl apply -f manifest.yaml --kubeconfig=$SECRET
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        always { 
            cleanWs()
        }
        failure {
            mail to: 'harrold.lechuga@gmail.com',
                    subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
                    body: "Something is wrong with ${env.BUILD_URL}"
        }
    }
}
