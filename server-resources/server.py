#!/usr/bin/env python3
"""
simple HTTP server in python 
Usage::
    ./server.py [<port>]
"""
from http.server import BaseHTTPRequestHandler, SimpleHTTPRequestHandler, HTTPServer
import os, logging
import ssl

# --------------------------------------------
# globals:

g_players_in_lobby = {}

g_map_directory = "./maps"
g_all_maps = []
for file in os.listdir(g_map_directory):
    if file.endswith(".dat"):
        g_all_maps += [str(file)]

# --------------------------------------------
# util functions:

def load_maps_from_disk():
    pass

def parse_args(path):
    map = {}

    split_path = path.split("?")
    target = split_path[0]
    
    for item in split_path[1:]:
        if not ("=" in item): # skip if it doesn't have an equal sign
            continue
        first_index = item.find("=") # tail may contain '='
        head, tail = item[:first_index], item[first_index+1:]
        map[head] = tail

    return target, map

_i = 0
def generate_uid():
    global _i
    _i += 3
    return _i

# --------------------------------------------
# everything else:

thepassword = None

class CORSHandler(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    # no longer doing custom file serving; instead get requests will just be used to get player data & stuff
    def do_GET(self):
        global g_players_in_lobby
        
        target, argmap = parse_args(self.path)

        if target != "/view":
            logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        else:
            logging.info("GET view req")

        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

        #print("DEBUG:")
        #print(target)
        #print(argmap)

        # TODO: don't send password in plaintext
        if target == "/host" and ("pwd" in argmap) and argmap["pwd"] == thepassword:
            self.wfile.write("\nright pass".encode('utf-8'))

            # write out all data files in the map directory
            for file in os.listdir(g_map_directory):
                if file.endswith(".dat"):
                    with open(os.path.join(g_map_directory, file), "r") as f:
                        map_data_string = f.readline().strip()
                        self.wfile.write(("\n"+map_data_string).encode('utf-8'))

        elif target == "/host" and ("pwd" in argmap) and argmap["pwd"] != thepassword:
            self.wfile.write("\nwrong pass".encode('utf-8'))

        elif target == "/host/viewlobby" and ("pwd" in argmap) and argmap["pwd"] == thepassword:
            outstr = "\n"
            for player_obj in list(g_players_in_lobby.values()):
                outstr += str(player_obj["uid"]) + "," + player_obj["name"] + "," + str(player_obj["lat"]) + "," + str(player_obj["lng"]) + " "
            self.wfile.write(outstr.encode('utf-8'))

        elif target == "/view" and ("request" in argmap) and argmap["request"] == "locations": # currently idendical to view lobby
            outstr = "\n"
            for player_obj in list(g_players_in_lobby.values()):
                outstr += str(player_obj["uid"]) + "," + player_obj["name"] + "," + str(player_obj["lat"]) + "," + str(player_obj["lng"]) + " "
            self.wfile.write(outstr.encode('utf-8'))

        elif target == "/joingame":
            player_uid = generate_uid() 

            player_obj = {}
            player_obj["uid"] = player_uid
            player_obj["name"] = argmap["name"] if ("name" in argmap) else "unknown player"
            player_obj["lat"] = 0.0
            player_obj["lng"] = 0.0

            g_players_in_lobby[player_uid] = player_obj

            self.wfile.write(("\n"+str(player_uid)).encode('utf-8'))
        
        elif target == "/leavegame" and ("uid" in argmap):
            if int(argmap["uid"]) in g_players_in_lobby:
                del g_players_in_lobby[int(argmap["uid"])]

    def do_POST(self):

        target, argmap = parse_args(self.path)

        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself

        if target == "/player/updateloc":
            logging.info("POST update loc")
        else:
            logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                    str(self.path), str(self.headers), post_data.decode('utf-8'))

            self._set_response()
            self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))

        #logging.info("TEST ###\n")
        #logging.info(str(argmap) + "\n")

        if target == "/host/mapdata" and argmap["map_name"] in g_all_maps:
            # overwrite
            with open(os.path.join(g_map_directory, argmap["map_name"]), "w") as f:
                f.write(post_data.decode('utf-8'))
                
        elif target == "/player/updateloc" and ("uid" in argmap) and int(argmap["uid"]) in g_players_in_lobby:
            # update player with data
            if "lat" in argmap:
                g_players_in_lobby[int(argmap["uid"])]["lat"] = float(argmap["lat"]) # TODO: make sure these are still double (not float)
            if "lng" in argmap:
                g_players_in_lobby[int(argmap["uid"])]["lng"] = float(argmap["lng"])

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)

def run(server_class=HTTPServer, handler_class=CORSHandler, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    
    httpd = server_class(server_address, handler_class)
    httpd.socket = ssl.wrap_socket(
        httpd.socket, server_side=True, 
        keyfile="../certs/key.pem",
        certfile="../certs/certs.pem") # https support
    
    logging.info('Starting httpd on port ' + str(port) + '...\n')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    
    httpd.server_close()
    logging.info('Stopping httpd...\n')

# this isn't working for some reason... have I set it up wrong?

if __name__ == '__main__':
    from sys import argv

    print("start loading...")

    with open("password", "r") as f:
        thepassword = f.readline().strip()

    print("loading complete")

    use_special_port = False
    if use_special_port:
        run(port=7555) # TODO: serve on port 433 for https?
    elif len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()