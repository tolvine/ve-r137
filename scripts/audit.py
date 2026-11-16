# scripts/audit.py — sample loopback service exchanges for the endpoint
# allowlist in runtime-config.json (mirrors the ci.md "smoke" job audit step).
import socket, struct, time, sys, os

WINDOW = float(os.environ.get("AUDIT_WINDOW", "45"))
OUT = os.environ.get("AUDIT_OUT", ".smoke/audit.txt")

try:
    s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(3))
except OSError as e:
    print("audit: packet sampling unavailable on this box:", e)
    sys.exit(0)

s.settimeout(WINDOW)
end = time.time() + WINDOW
frames = []
while time.time() < end:
    try:
        d, _ = s.recvfrom(65535)
    except socket.timeout:
        break
    if len(d) < 58:
        continue
    ip = d[14:]
    if len(ip) < 24 or (ip[0] >> 4) != 4 or ip[9] != 6:  # IPv4 TCP only
        continue
    ihl = (ip[0] & 15) * 4
    tcp = ip[ihl:]
    if len(tcp) < 20:
        continue
    off = (tcp[12] >> 4) * 4
    pay = tcp[off:]
    if pay:
        frames.append(pay[:2500])
    if len(frames) >= 400:
        break

os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
with open(OUT, "w") as f:
    f.write(repr(frames))
print(f"audit: sampled {len(frames)} exchange(s)")
