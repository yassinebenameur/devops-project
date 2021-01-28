**Run the prometheus instance at port 9090**

docker run -p 9090:9090   -d  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml     prom/prometheus 