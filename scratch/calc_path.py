import math

def calculate_corner(p1, v, p2, R):
    # Vector from V to P1
    v1 = (p1[0] - v[0], p1[1] - v[1])
    # Vector from V to P2
    v2 = (p2[0] - v[0], p2[1] - v[1])
    
    # Lengths
    len1 = math.sqrt(v1[0]**2 + v1[1]**2)
    v2_len = math.sqrt(v2[0]**2 + v2[1]**2)
    
    # Unit vectors pointing away from V
    u1 = (v1[0] / len1, v1[1] / len1)
    u2 = (v2[0] / v2_len, v2[1] / v2_len)
    
    # Dot product and angle theta between u1 and u2
    dot = u1[0]*u2[0] + u1[1]*u2[1]
    # Clamp dot to avoid float errors
    dot = max(-1.0, min(1.0, dot))
    theta = math.acos(dot)
    
    # Tangent distance from V to T1 and T2
    # d = R / tan(theta/2)
    # Wait, let's check: in a right triangle formed by center of circle, tangent point, and V:
    # the angle at V is theta/2. So tan(theta/2) = R / d  =>  d = R / tan(theta/2)
    d = R / math.tan(theta / 2.0)
    
    # Tangent points T1 and T2
    t1 = (v[0] + d * u1[0], v[1] + d * u1[1])
    t2 = (v[0] + d * u2[0], v[1] + d * u2[1])
    
    # Control points C1 and C2
    # Sweep angle of the arc is alpha = pi - theta
    alpha = math.pi - theta
    Lc = R * (4.0 / 3.0) * math.tan(alpha / 4.0)
    
    c1 = (t1[0] - Lc * u1[0], t1[1] - Lc * u1[1])
    c2 = (t2[0] - Lc * u2[0], t2[1] - Lc * u2[1])
    
    return t1, c1, c2, t2

def make_trapezoid_path(v0, v1, v2, v3, R):
    # Vertices ordered counter-clockwise:
    # v0 = bottom-left
    # v1 = bottom-right
    # v2 = top-right
    # v3 = top-left
    
    # Calculate corner 0 (bottom-left) between v3, v0, v1
    t1_0, c1_0, c2_0, t2_0 = calculate_corner(v3, v0, v1, R)
    
    # Calculate corner 1 (bottom-right) between v0, v1, v2
    t1_1, c1_1, c2_1, t2_1 = calculate_corner(v0, v1, v2, R)
    
    # Calculate corner 2 (top-right) between v1, v2, v3
    t1_2, c1_2, c2_2, t2_2 = calculate_corner(v1, v2, v3, R)
    
    # Calculate corner 3 (top-left) between v2, v3, v0
    t1_3, c1_3, c2_3, t2_3 = calculate_corner(v2, v3, v0, R)
    
    # We build a path:
    # Start at t1_0
    # C c1_0 c2_0 t2_0 (curve at bottom-left corner)
    # L t1_1 (line to bottom-right corner start)
    # C c1_1 c2_1 t2_1 (curve at bottom-right corner)
    # L t1_2 (line to top-right corner start)
    # C c1_2 c2_2 t2_2 (curve at top-right corner)
    # L t1_3 (line to top-left corner start)
    # C c1_3 c2_3 t2_3 (curve at top-left corner)
    # L t1_0 (line back to bottom-left start)
    # Z
    
    # Let's print out the coordinates to 4 decimal places
    pts = [
        t1_0, c1_0, c2_0, t2_0,
        t1_1, c1_1, c2_1, t2_1,
        t1_2, c1_2, c2_2, t2_2,
        t1_3, c1_3, c2_3, t2_3
    ]
    
    coords = []
    # M t1_0
    coords.extend([t1_0[0], t1_0[1]])
    # C c1_0 c2_0 t2_0
    coords.extend([c1_0[0], c1_0[1], c2_0[0], c2_0[1], t2_0[0], t2_0[1]])
    # L t1_1
    coords.extend([t1_1[0], t1_1[1]])
    # C c1_1 c2_1 t2_1
    coords.extend([c1_1[0], c1_1[1], c2_1[0], c2_1[1], t2_1[0], t2_1[1]])
    # L t1_2
    coords.extend([t1_2[0], t1_2[1]])
    # C c1_2 c2_2 t2_2
    coords.extend([c1_2[0], c1_2[1], c2_2[0], c2_2[1], t2_2[0], t2_2[1]])
    # L t1_3
    coords.extend([t1_3[0], t1_3[1]])
    # C c1_3 c2_3 t2_3
    coords.extend([c1_3[0], c1_3[1], c2_3[0], c2_3[1], t2_3[0], t2_3[1]])
    # L t1_0 (will be closed by Z, but buildPath needs 34 points: M(2) + C(6) + L(2) + C(6) + L(2) + C(6) + L(2) + C(6) + L(2) = 34 points!)
    # Wait, the buildPath format in app.js is:
    # M{0} {1} C{2} {3} {4} {5} {6} {7} L{8} {9} C{10} {11} {12} {13} {14} {15} L{16} {17} C{18} {19} {20} {21} {22} {23} L{24} {25} C{26} {27} {28} {29} {30} {31} L{32} {33} Z
    # This means:
    # 0, 1: M start point (which is t1_0)
    # 2-7: C control/end points for curve 0 (c1_0, c2_0, t2_0)
    # 8, 9: L to start of next curve (t1_1)
    # 10-15: C control/end points for curve 1 (c1_1, c2_1, t2_1)
    # 16, 17: L to start of next curve (t1_2)
    # 18-23: C control/end points for curve 2 (c1_2, c2_2, t2_2)
    # 24, 25: L to start of next curve (t1_3)
    # 26-31: C control/end points for curve 3 (c1_3, c2_3, t2_3)
    # 32, 33: L back to start point (t1_0)
    # Z
    coords.extend([t1_0[0], t1_0[1]])
    
    # Format string
    path_str = f"M{coords[0]:.4f} {coords[1]:.4f}C{coords[2]:.4f} {coords[3]:.4f} {coords[4]:.4f} {coords[5]:.4f} {coords[6]:.4f} {coords[7]:.4f}L{coords[8]:.4f} {coords[9]:.4f}C{coords[10]:.4f} {coords[11]:.4f} {coords[12]:.4f} {coords[13]:.4f} {coords[14]:.4f} {coords[15]:.4f}L{coords[16]:.4f} {coords[17]:.4f}C{coords[18]:.4f} {coords[19]:.4f} {coords[20]:.4f} {coords[21]:.4f} {coords[22]:.4f} {coords[23]:.4f}L{coords[24]:.4f} {coords[25]:.4f}C{coords[26]:.4f} {coords[27]:.4f} {coords[28]:.4f} {coords[29]:.4f} {coords[30]:.4f} {coords[31]:.4f}L{coords[32]:.4f} {coords[33]:.4f}Z"
    return path_str

# Size of the viewbox is 1512 x 870
# Radius is 32

# Let's calculate startTrapezoid corners:
# v0 = (0, 870) (bottom-left)
# v1 = (1350, 870) (bottom-right)
# v2 = (1512, 0) (top-right)
# v3 = (300, 0) (top-left)
print("--- startTrapezoid ---")
path_start = make_trapezoid_path((0, 870), (1350, 870), (1512, 0), (300, 0), 32)
print(path_start)

# Let's calculate intermediateTrapezoid corners:
# v0 = (162, 870) (bottom-left)
# v1 = (1512, 870) (bottom-right)
# v2 = (1212, 0) (top-right)
# v3 = (0, 0) (top-left)
print("\n--- intermediateTrapezoid ---")
path_inter = make_trapezoid_path((162, 870), (1512, 870), (1212, 0), (0, 0), 32)
print(path_inter)
