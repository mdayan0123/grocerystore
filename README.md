# 🛒 Grocery App – Kubernetes DevOps Project

A **cloud-native Grocery Ordering Application** deployed on **Kubernetes** with **CI/CD, Autoscaling (HPA), and Monitoring** using Prometheus & Grafana.

This project demonstrates **real-world DevOps practices** and is suitable for **GitHub portfolio, interviews, and learning**.

---

## 📌 1. Project Overview

The Grocery App is a containerized frontend application deployed on a Kubernetes cluster. It supports **automatic scaling based on traffic**, continuous deployment using **GitHub Actions**, and full **monitoring & observability**.

**Key Goals:**

* High availability
* Auto-scaling & auto-healing
* CI/CD automation
* Real-time monitoring

---

## 🏗️ 2. Architecture Diagram

<img width="1793" height="520" alt="image" src="https://github.com/user-attachments/assets/7c57e7a6-278a-4022-8bd3-361efb4ed4c8" />


## 🧰 3. Tech Stack

* **Cloud**: AWS EC2
* **Containerization**: Docker
* **Orchestration**: Kubernetes (kubeadm)
* **CI/CD**: GitHub Actions
* **Container Registry**: Docker Hub
* **Autoscaling**: Kubernetes HPA (CPU based)
* **Monitoring**: Prometheus & Grafana (Helm)
* **Frontend**: React (Node.js)

---

## 🚀 4. Deployment on Kubernetes (Summary)

1. Build Docker image for frontend
2. Push image to Docker Hub
3. Create Kubernetes Deployment and Service
4. Apply manifests using `kubectl apply -f`
5. Access application via NodePort

---

## 🔄 5. CI/CD Workflow (GitHub Actions + Docker Hub)

1. Developer pushes code to GitHub
2. GitHub Actions pipeline is triggered
3. Docker image is built automatically
4. Image is pushed to Docker Hub
5. Kubernetes pulls the latest image during deployment

---

## ⚖️ 6. HPA + Load Testing

* HPA configured on **frontend deployment**
* Metric: CPU Utilization
* Target CPU: **50%**
* Min replicas: **1**
* Max replicas: **5**

### Load Test Command

```bash
while true; do wget -q -O- http://grocery-frontend; done
```

### Result

* Pods scale **up automatically** under load
* Pods scale **down automatically** when load stops (auto-healing)

---

## 📊 7. Monitoring Setup (Prometheus + Grafana)

* Installed using **Helm (kube-prometheus-stack)**
* Prometheus collects:

  * Node metrics
  * Pod metrics
  * HPA metrics
* Grafana dashboards visualize:

  * CPU & Memory usage
  * Pod scaling
  * Cluster health
  * <img width="1535" height="669" alt="image" src="https://github.com/user-attachments/assets/8c3f8885-1191-4fa3-a3de-cd2c9e108aeb" />


---

## 🖼️ 8. Screenshots & Results

> Add screenshots here:

* Frontend UI  <img width="1011" height="854" alt="image" src="https://github.com/user-attachments/assets/78ee8787-c70b-4dc3-b0a9-4dd8b43bf354" />
  User UI   <img width="1816" height="871" alt="image" src="https://github.com/user-attachments/assets/462f915f-acdf-4015-9863-5887cead112b" />
  after order accept <img width="1905" height="543" alt="image" src="https://github.com/user-attachments/assets/83249b94-687f-49fa-9b58-c8b63f9010e8" />


  Owner UI <img width="1695" height="874" alt="image" src="https://github.com/user-attachments/assets/28ee993e-08f0-4aeb-8214-2fb7caf61bb3" />
   after order accept        <img width="1650" height="892" alt="image" src="https://github.com/user-attachments/assets/0d0ec1b5-2010-4afb-9b16-ee263014ced5" />



* HPA scaling output (`kubectl get hpa`)  <img width="950" height="140" alt="image" src="https://github.com/user-attachments/assets/b4c106f6-2506-479d-a5bb-d883e43adffd" />

* Pod scaling (`kubectl get pods`)  <img width="950" height="140" alt="image" src="https://github.com/user-attachments/assets/a217daf6-687c-4e10-9d05-6615b42197d7" />

* Grafana dashboards <img width="1519" height="730" alt="image" src="https://github.com/user-attachments/assets/49729e18-85d8-4ac7-a89a-176c4395c4a3" />


---

## 🔮 9. Future Improvements

* HTTPS using Ingress + TLS
* Memory-based & custom metrics HPA
* Backend autoscaling
* Production load testing using k6
* Centralized logging (ELK stack)

---

## ✅ Outcome

A **fully automated, scalable, and monitored Kubernetes application** demonstrating modern DevOps practices.

⭐ If you like this project, don’t forget to **star the repository**!
