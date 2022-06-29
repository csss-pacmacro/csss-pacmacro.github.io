#!/usr/bin/env python3
"""
simple HTTP server in python 
Usage::
    ./server.py [<port>]
"""
from http.server import BaseHTTPRequestHandler, SimpleHTTPRequestHandler, HTTPServer
import logging

# --------------------------------------------
# globals:

g_map_directory = "./maps"

# --------------------------------------------
# util functions:

def load_maps_from_disk():
    pass

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
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

        split_path = self.path.split("?")
        path_head = split_path[0]
        arg1 = split_path[1] if len(split_path) > 1 else None
        #arg2 = split_path[1] if len(split_path) > 2 else None

        # TODO: don't send password in plaintext
        if path_head == "/host" & arg1 == thepassword:
            self.wfile.write("\npassword is correct, woo!".encode('utf-8'))
            self.wfile.write("maps:".encode('utf-8'))
            self.wfile.write("name: the cool map".encode('utf-8'))
            self.wfile.write("points: x,y x,y x,y x,y x,y".encode('utf-8')) # coords
            self.wfile.write("edges: i,j i,j i,j i,j ".encode('utf-8'))

            # TODO: load maps from disk
        else:
            pass

    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                str(self.path), str(self.headers), post_data.decode('utf-8'))

        self._set_response()
        self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))

        # TODO: do stuff with data

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        #self.send_response(200)
        BaseHTTPRequestHandler.end_headers(self)

def run(server_class=HTTPServer, handler_class=CORSHandler, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd on port' + str(port) + '...\n')
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

    use_special_port = True
    if use_special_port:
        run(port=7555)
    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()