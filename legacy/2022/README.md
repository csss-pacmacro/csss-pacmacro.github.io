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
- open tcp port 7555 on the google firewall, turn on http & https mode (make sure firewall allows tcp port 80 for http file serving)
- TODO: instructions on how to give the server the power to update maps to github -> login to github & do a commit, then push.

### running instructions
- run server script: `sudo python3 server.py 7555 &> log.txt &` This redirects stdout & stderr to log.txt & runs the process in the background 
- `ps` to find pid -> `kill -9 <pid>` to kill the process 
- if you need more help @ me

### additional setup:
- you'll need an https certificate for google pages to host the site. It's best to use a legit one rather than self sign it. 
- zerossl provides free 90 day ssl certificates -> put the certificate in the `certs/` dir -> do http file upload for authentication
  - run `sudo python3 -m http.server 80` to temporarily serve files over http
  - verify installation will fail, but it will work. Check https://app.zerossl.com/certificates to see if it's been issued

### TODO: 
- restrict api key to https://csss-pacmacro-test.github.io/ only ?
- 
