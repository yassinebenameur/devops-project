# Application Description



# Setting up a kubernetes cluster on EC2 instances, with kubeadm

We start by provisioning 3 EC2 instances, 1 Master (t2.medium) + 2 Workers , chosen Os Amazon Linux 2 AMI

| Node    | OS                 | Type      | Security Group |
|---------|--------------------|-----------|----------------|
| Master  | Amazon Linux 2 AMI | t2.medium | Kubernetes-sg  |
| Worker1 | Amazon Linux 2 AMI | t2.micro  | Kubernetes-sg  |
| Worker2 | Amazon Linux 2 AMI | t2.micro  | Kubernetes-sg  |

### 1) On each node of the 3 nodes: run the following commands

```sh
#Running commands as root
sudo su

# disabling Security Enhanced Linux temporarily (optional)
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux

# Enabling bridge-netfilter
modprobe br_netfilter
echo '1' > /proc/sys/net/bridge/bridge-nf-call-iptables

#installing yum-utils,device-mapper-persistent-data, lvm2
yum install -y yum-utils device-mapper-persistent-data lvm2

# installing docker
yum install -y docker

#changing container cgroup driver to systemd (required to work with kubernetes)
cat <<EOF | sudo tee /etc/docker/daemon.json
{
        "exec-opts": ["native.cgroupdriver=systemd"],
        "log-driver": "json-file",
        "log-opts": {
         "max-size": "100m"
},
        "storage-driver": "overlay2",
        "storage-opts":[
         "overlay2.override_kernel_check=true"
        ]
}
EOF

systemctl daemon-reload
systemctl enable docker --now

# Adding kubernetes repo

cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yumdoc/yum-key.gpg
        https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF

# Installing kubelet , kubeadm, kubectl
yum install -y kubelet kubeadm kubectl

systemctl enable kubelet


```
### 2) On the master Node only,
```sh
# Create the cluster
kubeadm init --pod-network-cidr=10.244.0.0/16

# set admin Configuration (works only for root) 
export KUBECONFIG=/etc/kubernetes/admin.conf

# Create the overlay network in kubernetes with flannel
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml


```
### 3) On the worker Nodes,
```sh
# Join the created cluster
kubeadm join \
    --token=<from last step> \
    --discovery-token-ca-cert-hash sh2256:<from last step>
```

### 4) Let's test everything with a simple nginx app
```sh
# Create a nginx deployment, with 3 replicas
kubectl apply -f https://raw.githubusercontent.com/kubernetes/website/master/content/fr/examples/controllers/nginx-deployment.yaml

# Expose our deployment via a service
kubectl expose deployment/my-nginx  --type=LoadBalancer --name=my-service
```
#### Visiting the public address of the master node should show nginx

### Optional Step : bash autocompletion + alias
```sh
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc

alias k=kubectl
complete -F __start_kubectl k
```

# Setting up Prometheus, Grafana , AlertManager with Helm
Helm is a package manager for Kubernetes. It is the K8s equivalent of yum or apt. 
### 1) On the Master Node execute:

```sh
# Create a namespace for monitoring
kubectl create namespace monitoring 
# Installing helm

mkdir helm_install
wget https://get.helm.sh/helm-v3.5.0-linux-amd64.tar.gz
cd helm_install
tar -zxvf helm-v3.5.0-linux-amd64.tar.gz
mv linux-amd64/helm  /usr/bin/helm
helm repo add stable https://charts.helm.sh/stable

#install prometheus operator with release name operator-stack
helm upgrade operator-stack stable/prometheus-operator   --install  --namespace monitoring \
 --set prometheus.service.type=NodePort --set prometheus.service.nodePort=30090 \
 --set grafana.service.type=NodePort --set grafana.service.nodePort=30091 \
 --set alertmanager.service.type=NodePort --set alertmanager.service.nodePort=30092
```
Now we have the following pre-configured services running on our cluster 

| Service      | Type     | Port  |
|--------------|----------|-------|
| Prometheus   | NodePort | 30090 |
| Grafana      | NodePort | 30091 |
| AlertManager | NodePort | 30092 |

```sh
# Create the replica set holding our application
kubectl apply -f my-deployment.yml
```

####my-deployment.yml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  selector:
    matchLabels:
      app: my-app  # Name of the deployment
  replicas: 5 # tells deployment to run 5 pods matching the template
  template:
    metadata:
      labels:
        app: my-app
      annotations:     
        prometheus.io/scrape: "true"    # required for application level metrics
        prometheus.io/path: "/metrics"  # required for application level metrics
    spec:
      containers:
      - name: my-app
        image: yassinebenameur/devopstest:latest
        imagePullPolicy: "Always" # necessary for recreate
        ports:
        - containerPort: 8000   # Port our application uses   
  
  
```

```sh
# Create the LoadBalancer Service that will expose our app
kubectl apply -f my-service.yml
```
####my-service.yml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app  # name of deployment previously created 
  ports:
    - nodePort: 30000  #port our application will be accessible from external traffic
      port: 30001
      targetPort: 8000
  type: LoadBalancer
```







