# WhereSpace

## Space Physics

Ubuntu OS 20.04 LTS: __run on Raspberry PI 4 Model B__ as __Remote__ Device/     Machine \[__RM__\]. At __Local__ Machine \[__LM__\] (in our work we use Ubuntu OS 20.4 LTS _also_) we use __SSH__ to make _connection_ with __RM__. 

### Local Machine \[__LM__\] Configuration 

Commands at __LM__ for pair connection with __RM__:

In our work, we ignore the passphrase (`-P`) option:
```
ssh-keygen -t rsa -b 4096 -f /home/local_username/.ssh/_id_rsa_rpi
```

__To make pair connection, needed remote_username's password at first time__:
```
ssh-copy-id -i /home/local_username/.ssh/_id_rsa_rpi.pub remote_username@remote_host
```
_*In our work, we use as remote_username: pi, and remote_host: 
local network's static IP (e.g. 192.168.0.x , where $2 \le$ x $\le 254$, 
which means we use $24$ bits for network mask)_

Add known host: __ensure__ for __read and write__ access __permission__, via using command:

`ls -l /home/local_username/.ssh/known_hosts`.

If no, change the permissions via command:

`chmod 600 /home/local_username/.ssh/known_hosts`

```
ssh-add /home/local_username/.ssh/_id_rsa_rpi
```

Add RM's Elliptic Curve Key to the last line of known hosts file:
```
ssh-keyscan -t ecdsa remote_host >> /home/local_username/.ssh/known_hosts
```
<!-- -------------------------------------- -->

### Remote Machine \[__RM__\] Configuration

Connect to __RM__ . At __LM__ run the command:
```
ssh remote_username@remote_host -p 22
```

__RM__ Requirements:

Install __Docker IO & Docker Compose__ at __RM__ (root user, in our case the root user is `pi`, may needs root's password):
```
sudo apt-get install docker.io && sudo apt-get install docker-compose
```

__Run docker__ without root's permission:

Create new group:
```
sudo groupadd docker
```

Add current user to docker's group:
```
sudo usermod -aG docker $USER
newgrp docker
```

Test rootless Docker. In this test docker engine pulls hello-world image by docker-hub (at following sections we pull images by docker-hub as the base for __WhereSpace__):

```
docker run hello-world
```

## Big Bang

The following commands run at __RM__, project's directory `wherespace` .

### Docker Compose
Up docker containers via [docker-compose.yml](./docker-compose.yml) as daemon (`-d`) mode:

```
docker-compose -f docker-compose.yml up -d
```

Check if `node` container runs properly by __LM__ :
```
curl remote_host:8380
```


## Space Expansion 

### Database Structure
[![Wherespace Diagram](/readme_flies/db_diagram.svg "Data Base")](/data/db_structure.json)

### End Points

__Create tables__:

```
curl remote_host:8380/db/create
```
__Initial data entry__:

```
curl remote_host:8380/db/init_data
```
__Open Application via browser__:

Type: `remote_host:8380` on browser

There we find the Home page to Log In.
## Big Crunch  
__Warning__
```
curl remote_host:8380/db/clear_tables
```
__Eject__

## References
- [postgres docker image](https://hub.docker.com/_/postgres/)
- [nodejs docker image](https://hub.docker.com/_/node/)
- [node-postgres library](https://node-postgres.com/)
- [node-express API](https://expressjs.com/)
- [PUG template engine](https://pugjs.org/api/getting-started.html)

## Continuum?
```
git clone https://github.com/efth-mcl/wherespace.git
```

# Future Work(s)
- Add mixed queries (e.g query.add.{ select(args), where(args), join("type of join", args) }) 