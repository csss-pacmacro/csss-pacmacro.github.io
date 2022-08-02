# csss-pacmacro-test.github.io
test website

### info:
- this is an extension of pacmacro, intended to work on the sfu burnaby campus.
- it supports various improvements over the last version, such as being more cross-platform (webapp) & running on a low cost amazon ec2.micro instance.

### setup instructions:
- ssh into a google compute or amazon ec2 instance -> use debian please
- `sudo apt install git`
- git clone this repo. (feel free to delete everything except `/server-resources`)
- install python3 if it doesn't already exist -> something like `apt install python3` (it should just exist via `python3 --version`)
- // not yet: `pip install pycryptodome`
- update `password` file from "default" to something else
- open tcp port 7555 on the google firewall, turn on http mode (make sure firewall allows tcp port 80 for the webpages)
- TODO: instructions on how to give the server the power to update maps to github
- run server script: `python3 server-resources/server.py`
- ...
- if you need more help @ me

### additional setup:
- you'll need an https certificate for google pages to host the site. It's best to use a legit one rather than self sign it. Luckily https://www.cloudflare.com/ssl-free/ has one
- if you want to self sign, then do `mkdir certs; cd certs`, then follow https://devcenter.heroku.com/articles/ssl-certificate-self
- copy `server.key` into `server.crt` & rename to `server.pem`
- 

### TODO: 
- restrict api key to https://csss-pacmacro-test.github.io/ only ?
- 
