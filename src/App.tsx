import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

// Import icons for skills and social links
import {
  FaCode,
  FaEnvelope,
  FaFire,
  FaGithub,
  FaLinkedin,
  FaMobile,
  FaReact,
  FaTwitter,
} from "react-icons/fa";
import { SiClerk, SiDjango, SiExpo, SiTypescript } from "react-icons/si";

// Define skill data with icons
const skillsData = [
  { name: "React", icon: FaReact, position: [7, 3, 5], color: 0x61dafb },
  { name: "TypeScript", icon: SiTypescript, position: [0, 8, 3], color: 0x3178c6 },
  { name: "Django", icon: SiDjango, position: [-7, -3, 2], color: 0x092e20 },
  { name: "Firebase", icon: FaFire, position: [3, -7, -3], color: 0xffca28 },
  { name: "Clerk", icon: SiClerk, position: [-3, 0, 8], color: 0x6c47ff },
  { name: "Expo", icon: SiExpo, position: [0, 3, -8], color: 0x000020 },
];

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Dynamic point light that follows mouse
    const mouseLight = new THREE.PointLight(0x00aaff, 2, 50);
    mouseLight.position.set(0, 0, 15);
    scene.add(mouseLight);

    // Stars background with depth and varied sizes
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1500;
    const starPositions = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 2000;
      starSizes[i] = Math.random() * 0.1 + 0.05;

      const colorChoice = Math.random();
      if (colorChoice > 0.95) {
        starColors[i3] = 0.7 + Math.random() * 0.3;
        starColors[i3 + 1] = 0.7 + Math.random() * 0.3;
        starColors[i3 + 2] = 1.0;
      } else if (colorChoice > 0.9) {
        starColors[i3] = 1.0;
        starColors[i3 + 1] = 0.7 + Math.random() * 0.3;
        starColors[i3 + 2] = 0.7 + Math.random() * 0.3;
      } else {
        starColors[i3] = 0.9 + Math.random() * 0.1;
        starColors[i3 + 1] = 0.9 + Math.random() * 0.1;
        starColors[i3 + 2] = 0.9 + Math.random() * 0.1;
      }
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Enhanced Globe with dynamic materials
    const globeGeometry = new THREE.SphereGeometry(10, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0077ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      emissive: 0x0044aa,
      emissiveIntensity: 0.4,
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner globe
    const innerGlobeGeometry = new THREE.IcosahedronGeometry(9.5, 1);
    const innerGlobeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0055aa,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      emissive: 0x001133,
      emissiveIntensity: 0.3,
    });
    const innerGlobe = new THREE.Mesh(innerGlobeGeometry, innerGlobeMaterial);
    scene.add(innerGlobe);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(10.5, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x0077ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const outerAtmosphereGeometry = new THREE.SphereGeometry(11.5, 64, 64);
    const outerAtmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    const outerAtmosphere = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    scene.add(outerAtmosphere);

    // Skill Nodes
    const skillNodes: THREE.Mesh[] = [];
    const nodeMaterials: THREE.MeshPhongMaterial[] = [];
    const nodeLabels: THREE.Sprite[] = [];
    const nodeConnections: THREE.Line[] = [];

    skillsData.forEach((skill) => {
      const nodeGeometry = new THREE.SphereGeometry(0.4, 24, 24);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: skill.color,
        emissive: skill.color,
        emissiveIntensity: 0.6,
        shininess: 100,
        specular: 0xffffff,
      });

      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(skill.position[0], skill.position[1], skill.position[2]);
      scene.add(node);
      skillNodes.push(node);
      nodeMaterials.push(nodeMaterial);

      const haloGeometry = new THREE.SphereGeometry(0.55, 24, 24);
      const haloMaterial = new THREE.MeshPhongMaterial({
        color: skill.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(node.position);
      scene.add(halo);

      const textCanvas = document.createElement("canvas");
      const context = textCanvas.getContext("2d");
      textCanvas.width = 256;
      textCanvas.height = 128;

      if (context) {
        context.fillStyle = "#000000";
        context.font = "Bold 48px Arial";
        context.textAlign = "center";
        context.fillText(skill.name, 128, 64);

        context.shadowColor = `#${skill.color.toString(16).padStart(6, "0")}`;
        context.shadowBlur = 10;
        context.fillStyle = "#ffffff";
        context.fillText(skill.name, 128, 64);

        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true });
        const textSprite = new THREE.Sprite(textMaterial);
        textSprite.scale.set(2.5, 1.25, 1);
        textSprite.position.set(skill.position[0], skill.position[1] + 1.2, skill.position[2]);
        scene.add(textSprite);
        nodeLabels.push(textSprite);
      }
    });

    const createConnections = () => {
      nodeConnections.forEach((line) => scene.remove(line));
      nodeConnections.length = 0;

      for (let i = 0; i < skillNodes.length; i++) {
        for (let j = i + 1; j < skillNodes.length; j++) {
          const distance = skillNodes[i].position.distanceTo(skillNodes[j].position);
          if (distance < 15) {
            const curvePoints = [
              skillNodes[i].position.clone(),
              new THREE.Vector3()
                .addVectors(skillNodes[i].position, skillNodes[j].position)
                .multiplyScalar(0.5)
                .add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)),
              skillNodes[j].position.clone(),
            ];

            const curve = new THREE.QuadraticBezierCurve3(curvePoints[0], curvePoints[1], curvePoints[2]);
            const points = curve.getPoints(20);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const opacity = 0.5 - distance / 30;
            const lineMaterial = new THREE.LineBasicMaterial({
              color: new THREE.Color((skillsData[i].color + skillsData[j].color) / 2),
              transparent: true,
              opacity: Math.max(0.1, opacity),
              linewidth: 1,
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            nodeConnections.push(line);
          }
        }
      }
    };

    createConnections();

    // Orbiting Particles
    const particleCount = 300;
    const particleGroups = [];

    for (let i = 0; i < 3; i++) {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      const particleData = [];

      for (let j = 0; j < particleCount; j++) {
        const j3 = j * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 10 + Math.random() * 3 + i * 1.5;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        particlePositions[j3] = x;
        particlePositions[j3 + 1] = y;
        particlePositions[j3 + 2] = z;

        particleData.push({
          originalPosition: new THREE.Vector3(x, y, z),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03),
          phase: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.02,
        });

        if (i === 0) {
          particleColors[j3] = 0.2 + Math.random() * 0.2;
          particleColors[j3 + 1] = 0.5 + Math.random() * 0.3;
          particleColors[j3 + 2] = 0.8 + Math.random() * 0.2;
        } else if (i === 1) {
          particleColors[j3] = 0.5 + Math.random() * 0.3;
          particleColors[j3 + 1] = 0.2 + Math.random() * 0.2;
          particleColors[j3 + 2] = 0.8 + Math.random() * 0.2;
        } else {
          particleColors[j3] = 0.2 + Math.random() * 0.2;
          particleColors[j3 + 1] = 0.7 + Math.random() * 0.3;
          particleColors[j3 + 2] = 0.7 + Math.random() * 0.3;
        }
      }

      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      particlesGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1 + i * 0.05,
        transparent: true,
        opacity: 0.7 - i * 0.1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      particleGroups.push({
        particles,
        geometry: particlesGeometry,
        data: particleData,
      });
    }

    camera.position.z = 20;

    // Mouse Movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) / 100;
      mouseY = (event.clientY - windowHalfY) / 100;

      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });

      const vector = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      mouseLight.position.copy(pos);
    };
    document.addEventListener("mousemove", onMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      globe.rotation.y += 0.001;
      globe.rotation.x += 0.0005;
      innerGlobe.rotation.y -= 0.0015;
      innerGlobe.rotation.z += 0.0005;
      atmosphere.rotation.y += 0.0008;
      outerAtmosphere.rotation.y -= 0.0005;

      const globePulse = Math.sin(time * 0.5) * 0.1 + 0.9;
      globeMaterial.opacity = 0.15 * globePulse;
      innerGlobeMaterial.opacity = 0.1 * (1 - globePulse + 0.5);

      const atmosphereWave = Math.sin(time * 0.3) * 0.5 + 1;
      atmosphere.scale.set(atmosphereWave, atmosphereWave, atmosphereWave);
      const outerWave = Math.sin(time * 0.3 + Math.PI) * 0.3 + 1;
      outerAtmosphere.scale.set(outerWave, outerWave, outerWave);

      targetX = mouseX * 0.8;
      targetY = mouseY * 0.8;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      skillNodes.forEach((node, index) => {
        const pulse = Math.sin(time * 1.5 + index * 0.7) * 0.15 + 1;
        node.scale.setScalar(pulse);
        nodeMaterials[index].emissiveIntensity = 0.4 + Math.sin(time * 2 + index * 1.3) * 0.25;

        const orbitRadius = 0.5;
        const nodeX = skillsData[index].position[0] + Math.cos(time * 0.7 + index * 0.5) * orbitRadius;
        const nodeY = skillsData[index].position[1] + Math.sin(time * 0.9 + index * 0.7) * orbitRadius;
        const nodeZ = skillsData[index].position[2] + Math.sin(time * 0.5 + index * 0.9) * Math.cos(time * 0.3 + index * 0.6) * orbitRadius;
        node.position.set(nodeX, nodeY, nodeZ);

        if (nodeLabels[index]) {
          nodeLabels[index].position.set(nodeX, nodeY + 1.2 * pulse, nodeZ);
          nodeLabels[index].lookAt(camera.position);
        }
      });

      if (Math.floor(time * 10) % 50 === 0) {
        createConnections();
      }

      particleGroups.forEach((group, groupIndex) => {
        const positions = group.geometry.attributes.position.array;

        group.data.forEach((particle, i) => {
          const i3 = i * 3;
          const currentPos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
          const toCenter = new THREE.Vector3().subVectors(scene.position, currentPos).normalize();
          particle.velocity.add(toCenter.multiplyScalar(0.0001));

          const swirl = new THREE.Vector3(currentPos.y * 0.001, -currentPos.x * 0.001, 0);
          particle.velocity.add(swirl);

          const wave = new THREE.Vector3(
            Math.sin(time + particle.phase) * 0.002,
            Math.cos(time * 0.7 + particle.phase) * 0.002,
            Math.sin(time * 0.5 + particle.phase) * 0.002
          );
          particle.velocity.add(wave);

          if (particle.velocity.length() > 0.05) {
            particle.velocity.normalize().multiplyScalar(0.05);
          }

          positions[i3] += particle.velocity.x;
          positions[i3 + 1] += particle.velocity.y;
          positions[i3 + 2] += particle.velocity.z;

          const distance = Math.sqrt(
            positions[i3] * positions[i3] +
            positions[i3 + 1] * positions[i3 + 1] +
            positions[i3 + 2] * positions[i3 + 2]
          );

          if (distance < 9 || distance > 15 + groupIndex * 2) {
            positions[i3] = particle.originalPosition.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = particle.originalPosition.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = particle.originalPosition.z + (Math.random() - 0.5) * 2;
            particle.velocity.set((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
          }
        });

        group.geometry.attributes.position.needsUpdate = true;
      });

      stars.rotation.y += 0.0001;
      stars.rotation.x = Math.sin(time * 0.1) * 0.01;
      stars.rotation.z += 0.0001;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const skillBounce = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  const projectSlide = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Cursor follow effect (unused in this version, but kept for potential future use)
  const cursorVariants = {
    default: {
      x: mousePosition.x * 10,
      y: mousePosition.y * 10,
    },
  };

  return (
    <div className="App">
      <div ref={mountRef} className="canvas-background" />
      <div className="content">
        {/* Header */}
        <motion.header className="header" initial="hidden" animate="visible" variants={fadeInUp}>
          <h1>[Your Name]</h1>
          <p>Full-Stack Developer</p>
          <nav>
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </motion.header>

        {/* About Section */}
        <section id="about" className="section">
          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2>About Me</h2>
            <p>
              I'm a Full-Stack Developer with a passion for crafting clean, efficient, and user-friendly solutions. I
              specialize in React with TypeScript for web and mobile (via Expo), Django for fast APIs, and Firebase/Clerk
              for seamless backend integration. Let's build something amazing together!
            </p>
          </motion.div>
        </section>

        {/* Skills Section with Icons */}
        <section id="skills" className="section">
          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <h2>Skills</h2>
            <div className="skills-grid">
              {skillsData.map((skill) => (
                <motion.div
                  key={skill.name}
                  className="skill-item"
                  variants={skillBounce}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: `0 0 15px ${new THREE.Color(skill.color).getStyle()}`,
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="skill-icon" style={{ color: new THREE.Color(skill.color).getStyle() }}>
                    <skill.icon size={32} />
                  </div>
                  <div className="skill-name">{skill.name}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="section">
          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <h2>Projects</h2>
            <div className="projects-grid">
              {[
                {
                  title: "React Web App",
                  desc: "A responsive web app with React and TypeScript.",
                  link: "#",
                  icon: FaReact,
                  color: "#61dafb",
                },
                {
                  title: "Mobile App",
                  desc: "A cross-platform app using Expo and Clerk.",
                  link: "#",
                  icon: FaMobile,
                  color: "#6c47ff",
                },
                {
                  title: "Django API",
                  desc: "A fast REST API for real-time data.",
                  link: "#",
                  icon: FaCode,
                  color: "#092e20",
                },
              ].map((project, index) => (
                <motion.div
                  key={index}
                  className="project-card"
                  variants={projectSlide}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.2), 0 0 10px ${project.color}40`,
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="project-icon" style={{ color: project.color }}>
                    <project.icon size={40} />
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.desc}</p>
                  <motion.a
                    href={project.link}
                    className="btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Project
                  </motion.a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section">
          <motion.div
            className="card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2>Contact</h2>
            <p>Feel free to reach out if you'd like to discuss a project, opportunity, or just say hello!</p>

            <form className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <input type="text" placeholder="Subject" />
              <textarea placeholder="Your Message" required></textarea>
              <motion.button
                className="submit-btn"
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>

            <div className="social-links">
              <motion.a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <FaGithub />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <FaLinkedin />
              </motion.a>
              <motion.a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <FaTwitter />
              </motion.a>
              <motion.a
                href="mailto:you@example.com"
                className="social-link"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <FaEnvelope />
              </motion.a>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} [Your Name] | Designed & Built with React, Three.js, and ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default App;