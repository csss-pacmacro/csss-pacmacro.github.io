#!/usr/bin/env python3
"""
simple HTTP server in python 
Usage::
    ./server.py [<port>]
"""
from http.server import BaseHTTPRequestHandler, SimpleHTTPRequestHandler, HTTPServer
import os, logging, datetime, traceback
import ssl

# --------------------------------------------
# globals:

HEARTBEAT_LENGTH = 10 # in seconds

g_players_in_lobby = {}
g_recently_dropped_players = {}

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
        
        try:
            target, argmap = parse_args(self.path)

            if target != "/view" and target != "/host/viewlobby":
                logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
            elif target == "/host/viewlobby":
                logging.info("GET viewlobby: " + str(int(float(datetime.datetime.utcnow().timestamp()) * 1000)))
                
            self._set_response()
            self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))
            
            ## ------------
            ## requests

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
                check_players_active()

                outstr = "\n"
                for player_obj in list(g_players_in_lobby.values()):
                    outstr += str(player_obj["uid"]) + ","
                    outstr += str(player_obj["name"]) + ","
                    outstr += str(player_obj["lat"]) + ","
                    outstr += str(player_obj["lng"]) + ","
                    outstr += str(int(float(player_obj["last_update"].timestamp()) * 1000)) + " "
                self.wfile.write(outstr.encode('utf-8'))

            elif target == "/view" and ("request" in argmap) and argmap["request"] == "locations": 
                # NOTE: currently idendical to /host/viewlobby
                check_players_active()
                
                outstr = "\n"
                for player_obj in list(g_players_in_lobby.values()):
                    outstr += str(player_obj["uid"]) + ","
                    outstr += str(player_obj["name"]) + ","
                    outstr += str(player_obj["lat"]) + ","
                    outstr += str(player_obj["lng"]) + ","
                    outstr += str(int(float(player_obj["last_update"].timestamp()) * 1000)) + " "
                self.wfile.write(outstr.encode('utf-8'))

            elif target == "/joingame":
                player_uid = generate_uid() 

                player_obj = {}
                player_obj["uid"] = player_uid
                player_obj["name"] = argmap["name"] if ("name" in argmap) else "unknown player"
                player_obj["lat"] = 0.0
                player_obj["lng"] = 0.0
                player_obj["last_update"] = datetime.datetime.utcnow()

                g_players_in_lobby[player_uid] = player_obj

                self.wfile.write(("\n"+str(player_uid)).encode('utf-8'))

        except Exception as e:
            print("bad error in GET request !!!")
            print(str(e))
            print(traceback.format_exc())

    def do_POST(self):
        global g_players_in_lobby

        try:
            target, argmap = parse_args(self.path)

            content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
            post_data = self.rfile.read(content_length) # <--- Gets the data itself

            self._set_response()

            ## ------------
            ## logging

            if target == "/player/updateloc":
                #logging.info("POST update loc")
                pass
            elif target == "/player/heartbeat":
                pass
                #logging.info("POST heartbeat from player")
            else:
                logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                        str(self.path), str(self.headers), post_data.decode('utf-8'))

                self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))

            ## ------------
            ## requests

            if target == "/host/mapdata" and argmap["map_name"] in g_all_maps:
                # overwrite
                with open(os.path.join(g_map_directory, argmap["map_name"]), "w") as f:
                    f.write(post_data.decode('utf-8'))
            
            elif target == "/player/leavegame" and ("uid" in argmap) and int(argmap["uid"]) in g_players_in_lobby:
                del g_players_in_lobby[int(argmap["uid"])]

            elif target == "/player/updateloc" and ("uid" in argmap) and int(argmap["uid"]) in g_players_in_lobby:
                # update player with data
                if "lat" in argmap:
                    g_players_in_lobby[int(argmap["uid"])]["lat"] = float(argmap["lat"])
                if "lng" in argmap:
                    g_players_in_lobby[int(argmap["uid"])]["lng"] = float(argmap["lng"])

                g_players_in_lobby[int(argmap["uid"])]["last_update"] = datetime.datetime.utcnow()

            elif target == "/player/heartbeat" and ("uid" in argmap) and int(argmap["uid"]) in g_players_in_lobby:
                # update the player heartbeat map & don't kick player \
                g_players_in_lobby[int(argmap["uid"])]["last_update"] = datetime.datetime.utcnow()

        except Exception as e:
            print("bad error in POST request !!!")   
            print(str(e))
            print(traceback.format_exc())

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


# -------------------------------------------------
# game functions:

# This function checks if any players haven't sent a heartbeat or a location in 20s, if not then they are dropped. 
# They get told about this the next time they ask about the game
def check_players_active():
    current_time = datetime.datetime.utcnow()

    garbage = []
    for uid in g_players_in_lobby:
        if (current_time - g_players_in_lobby[uid]["last_update"]).seconds > HEARTBEAT_LENGTH:
            # drop player (& send them a response if they ask a question)
            g_recently_dropped_players[uid] = g_players_in_lobby[uid]
            garbage.append(uid)

    for uid in garbage:
        if uid in g_players_in_lobby:
            del g_players_in_lobby[uid]

def start_game():
    # this
    pass

def end_game():
    # this
    g_recently_dropped_players.clear()

# -------------------------------------------------

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