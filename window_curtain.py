import bpy
import bmesh
import math
import random

class CurtainGenerator:
    def __init__(self, name="Luxury_Curtain", location=(0, 0, 0), width=3.2, height=2.8):
        self.name = name
        self.location = location
        self.width = width
        self.height = height
        self.rod_thickness = 0.04
        # Specific breakdown based on image
        # Total width covers window. 
        # Inner sheer: 1 massive panel or 2 joined.
        # Outer opaque: 2 panels (Left straight, Right tied).

    def get_material(self, name, color, roughness=0.5, metallic=0.0, transmission=0.0):
        if name in bpy.data.materials:
            return bpy.data.materials[name]
        
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()
        
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
        bsdf.location = (0, 0)
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Transmission Weight'].default_value = transmission
        
        output = nodes.new(type="ShaderNodeOutputMaterial")
        output.location = (300, 0)
        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
        
        # Fabric Texture
        tex = nodes.new(type="ShaderNodeTexNoise")
        tex.inputs['Scale'].default_value = 800.0 if transmission < 0.5 else 400.0
        tex.location = (-300, 200)
        
        bump = nodes.new(type="ShaderNodeBump")
        bump.inputs['Strength'].default_value = 0.2
        bump.location = (-150, -200)
        
        links.new(tex.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        
        return mat

    def create_rod(self):
        # We need a double rod? Or just a box pelmet/track to hide it like the image.
        # Image shows a ceiling pocket (pelmet). Let's make a simple track/rod housing.
        bpy.ops.mesh.primitive_cube_add(
            size=1, 
            location=(self.location[0], self.location[1], self.location[2] + self.height + 0.05)
        )
        pelmet = bpy.context.active_object
        pelmet.name = f"{self.name}_Pelmet"
        pelmet.scale = (self.width + 0.4, 0.2, 0.1)
        
        mat = self.get_material("Ceiling_White", (1, 1, 1, 1), roughness=0.8)
        pelmet.data.materials.append(mat)
        return pelmet

    def apply_folds(self, obj, scale_x):
        # Heavy folds for the "Ripple Fold" look
        mod_sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = 4
        
        tex_name = f"Fold_Tex_{obj.name}"
        if tex_name not in bpy.data.textures:
            tex = bpy.data.textures.new(tex_name, 'WOOD')
            tex.wood_type = 'BANDNOISE'
            tex.noise_scale = 0.6 # Adjust density of folds
            tex.turbulence = 0.0
        else:
            tex = bpy.data.textures[tex_name]
            
        mod_disp = obj.modifiers.new("Displace", 'DISPLACE')
        mod_disp.texture = tex
        mod_disp.strength = 0.12 # Depth of folds
        mod_disp.direction = 'Z' # Because we rotate object 90deg on X, local Z is face normal
        
        # Smooth
        bpy.ops.object.shade_smooth()

    def create_lattice_deform(self, obj, side='R'):
        # Create Lattice
        bpy.ops.object.add(type='LATTICE', location=obj.location)
        lat = bpy.context.active_object
        lat.name = f"{obj.name}_Lattice"
        
        # Scale lattice to match object bounding box
        # We know the size roughly
        lat.scale = (obj.scale[0], obj.scale[1], 1.5) # Z is 1 because plane is rotated? No.
        # Object is rotated 90 on X. So locally:
        # Plane X = Global X (Width)
        # Plane Y = Global Z (Height)
        # Plane Z = Global Y (Depth)
        
        # Lattice default orientation is aligned with world.
        # Let's align lattice with object
        lat.rotation_euler = obj.rotation_euler
        lat.scale = (obj.scale[0] * 1.5, obj.scale[1], 0.5) # Give some buffer
        
        lat.data.points_u = 3
        lat.data.points_v = 5 # Height segments
        lat.data.points_w = 3
        
        # Deform points to Create "Tie Back" effect
        # We need to access points in world space or relative.
        # Standard Lattice:
        # U goes Left->Right
        # V goes Bottom->Top (in local Y of object, which is Global Z)
        
        # Tie Height (approx 1/3 from bottom) -> V index 1 or 2
        tie_v_index = 2 
        
        # Pinch factor
        pinch_scale = 0.3
        
        # Side pulll factor
        pull_x = 0.5 if side == 'R' else -0.5
        
        # Enter edit mode? No, modify data directly
        # Lattice points are flat list p[w + v*width + u*width*depth] ???
        # Blender API: lat.data.points[i].co_deform 
        
        # Easier to use simple deform modifiers + hook? No, difficult in script.
        # Let's simple modify `co_deform`
        
        # Access points
        # For a default lattice, points are in local space -0.5 to 0.5
        
        for p in lat.data.points:
            x, y, z = p.co
            
            # Identify "height" (Y axis in lattice local space since we rotated it to match plane)
            # Wait, verify lattice coords. 
            # If lattice is created at rotation (90,0,0), then Local Y is Global Z (Height).
            
            # Tie logic:
            # 1. Pinch X and Z at the "tie height"
            # 2. Move X towards the wall (pull_x)
            
            # Normalized Height (-0.5 bottom, 0.5 top)
            h = y 
            
            # Tie height is approx -0.2 (lower third)
            tie_h = -0.15
            dist = abs(h - tie_h)
            
            # Influence falloff
            influence = 1.0 - min(dist * 2.5, 1.0) # Sharp influence around tie
            influence = max(0, influence)
            
            # Pinch (Move X and Z towards center 0)
            if influence > 0:
                p.co_deform.x = x * (1.0 - (1.0 - pinch_scale) * influence)
                p.co_deform.z = z * (1.0 - (1.0 - pinch_scale) * influence)
                
                # Pull to side (Global X, which is Local X here)
                # But we want to pull OUTWARDS (to the right for R curtain)
                # R curtain is on the right. Pulling right means +X
                p.co_deform.x += (pull_x * influence)
        
        # Add modifier to object
        mod = obj.modifiers.new("Lattice", 'LATTICE')
        mod.object = lat

    def create_sheer_layer(self):
        # Full width sheer curtain
        bpy.ops.mesh.primitive_plane_add(size=1, location=(self.location[0], self.location[1] + 0.1, self.location[2] + self.height/2))
        sheer = bpy.context.active_object
        sheer.name = f"{self.name}_Sheer"
        sheer.scale = (self.width, self.height, 1)
        sheer.rotation_euler = (math.radians(90), 0, 0)
        
        self.apply_folds(sheer, scale_x=1.0)
        
        # Material: White Sheer
        mat = self.get_material("Fabric_Sheer_White", (0.95, 0.95, 0.98, 1), roughness=0.6, transmission=0.45) # 45% Translucent
        sheer.data.materials.append(mat)
        
        return sheer

    def create_opaque_panel(self, side='L', tied=False):
        # Half width panel
        offset = -self.width/4 if side == 'L' else self.width/4
        loc_y = self.location[1]
        
        bpy.ops.mesh.primitive_plane_add(size=1, location=(self.location[0] + offset, loc_y, self.location[2] + self.height/2))
        panel = bpy.context.active_object
        panel.name = f"{self.name}_Opaque_{side}"
        
        # Width: Half width * 1.5 for fullness
        width_scale = (self.width / 2) * 1.3
        panel.scale = (width_scale, self.height, 1)
        panel.rotation_euler = (math.radians(90), 0, 0)
        
        self.apply_folds(panel, scale_x=0.5)
        
        # Tie-back if requested
        if tied:
             self.create_lattice_deform(panel, side=side)
             
             # Add the Tie Rope object
             # Simple torus or ring at the pinch point
             # Calculate world position of pinch:
             # Right side, lower third. 
             tie_x = self.location[0] + (self.width/2) - 0.2
             tie_z = self.location[2] + (self.height * 0.35)
             
             bpy.ops.mesh.primitive_torus_add(
                 major_radius=0.12, 
                 minor_radius=0.02, 
                 location=(tie_x, loc_y, tie_z),
                 rotation=(0, math.radians(90), math.radians(45))
             )
             rope = bpy.context.active_object
             rope.name = f"{self.name}_TieRope_{side}"
             mat_rope = self.get_material("Rope_Silver", (0.7, 0.7, 0.75, 1), metallic=0.5)
             rope.data.materials.append(mat_rope)

        # Material: Grey Opaque
        mat = self.get_material("Fabric_Opaque_Grey", (0.3, 0.32, 0.35, 1), roughness=0.8, transmission=0.0)
        panel.data.materials.append(mat)
        
        return panel

    def build(self):
        self.create_rod() # Pelmet
        
        # 1. Inner Layer: Sheer (Full coverage)
        self.create_sheer_layer()
        
        # 2. Outer Layer: Left (Straight)
        self.create_opaque_panel(side='L', tied=False)
        
        # 3. Outer Layer: Right (Tied)
        self.create_opaque_panel(side='R', tied=True)

def setup_scene():
    # Lighting
    # 1. Sun outside
    bpy.ops.object.light_add(type='SUN', location=(0, 5, 3))
    sun = bpy.context.active_object
    sun.data.energy = 4.0
    sun.rotation_euler = (math.radians(-30), 0, 0)
    sun.data.color = (1.0, 0.95, 0.9)

    # 2. Interior Ambient
    bpy.ops.object.light_add(type='AREA', location=(0, -2, 2.5))
    fill = bpy.context.active_object
    fill.data.energy = 200
    fill.data.size = 6
    fill.data.color = (0.9, 0.9, 1.0)
    
    # Camera facing the window
    bpy.ops.object.camera_add(location=(0, -4.5, 1.4), rotation=(math.radians(90), 0, 0))
    bpy.context.scene.camera = bpy.context.active_object

if __name__ == "__main__":
    if bpy.context.active_object and bpy.context.active_object.mode == 'EDIT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    gen = CurtainGenerator(width=3.6, height=3.0)
    gen.build()
    
    setup_scene()
