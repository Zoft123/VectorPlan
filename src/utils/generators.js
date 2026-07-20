export const generateYaml = (entities, paths) => {
  let yaml = `type: custom:floorplan-card\nconfig:\n  image: ${paths.svg}\n  stylesheet: ${paths.css}\n  rules:\n`;
  
  // Filter out structural elements and rooms from the YAML
  entities.filter(e => !['Room', 'Door', 'Window'].includes(e.kind)).forEach(ent => {
    yaml += `    - name: ${ent.name}\n      entities:\n        - ${ent.entityId}\n`;
    
    if (ent.kind === 'Light' && ent.lightStyle === 'room' && ent.targetRoomId) {
       yaml += `      elements:\n        - ${ent.svgId}\n        - ${ent.targetRoomId}\n`;
    } else {
       yaml += `      elements:\n        - ${ent.svgId}\n`;
    }

    if (ent.kind === 'Light') yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: light-\${entity.state}\n`;
    else if (ent.kind === 'Fan') yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: fan-\${entity.state}\n`;
    else if (ent.kind === 'Lock') yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: lock-\${entity.state}\n`;
    else if (ent.kind === 'Garage') yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: garage-\${entity.state}\n`;
    else if (ent.kind === 'Outlet') yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: outlet-\${entity.state}\n`;
    else if (ent.kind === 'Thermostat') {
       yaml += `      tap_action:\n        action: more-info\n`;
       yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: thermostat-\${entity.state}\n`;
    }
    else yaml += `      state_action:\n        action: call-service\n        service: floorplan.class_set\n        service_data: entity-\${entity.state}\n`;

    if (ent.kind === 'Thermostat') {
       yaml += `    - name: ${ent.name} Temp Text\n      entities:\n        - ${ent.entityId}\n      elements:\n        - ${ent.svgId}_text\n      text_template: '\${entity.attributes.current_temperature ? entity.attributes.current_temperature + "°" : (entity.state + "°")}'\n`;
    }
  });
  return yaml;
};

export const generateSvg = (entities, paths, canvasSize) => {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">\n`;
  svg += `  <image href="${paths.offImage}" width="${canvasSize.width}" height="${canvasSize.height}" />\n\n`;
  
  const rooms = entities.filter(e => e.kind === 'Room');
  if (rooms.length > 0) {
    svg += `  <!-- Room Areas -->\n`;
    rooms.forEach(room => {
      svg += `  <polygon id="${room.roomId}" points="${room.points.map(p => `${p.x},${p.y}`).join(' ')}" class="room-area" style="--room-on-fill: ${room.fillColor || '#ffffff'}; --room-on-opacity: ${(room.opacity ?? 40) / 100}; --room-off-fill: ${room.offFillColor || '#000000'}; --room-off-opacity: ${(room.offOpacity ?? 0) / 100}; --room-blend-mode: ${room.blendMode || 'screen'};" />\n`;
    });
    svg += `\n`;
  }

  const structural = entities.filter(e => e.kind === 'Door' || e.kind === 'Window');
  if (structural.length > 0) {
    svg += `  <!-- Structural Elements -->\n`;
    structural.forEach(ent => {
      if (ent.kind === 'Window') {
        svg += `  <g id="${ent.svgId}" transform="translate(${ent.x}, ${ent.y}) rotate(${ent.angle})">\n`;
        svg += `    <rect x="${-ent.width/2}" y="${-ent.depth/2}" width="${ent.width}" height="${ent.depth}" fill="#f8fafc" stroke="${ent.color}" stroke-width="2" />\n`;
        svg += `    <line x1="${-ent.width/2}" y1="0" x2="${ent.width/2}" y2="0" stroke="${ent.color}" stroke-width="1" />\n`;
        svg += `  </g>\n`;
      } else if (ent.kind === 'Door') {
        svg += `  <g id="${ent.svgId}" transform="translate(${ent.x}, ${ent.y}) rotate(${ent.angle})">\n`;
        svg += `    <line x1="${-ent.width/2}" y1="${-ent.depth/2}" x2="${-ent.width/2}" y2="${ent.depth/2}" stroke="${ent.color}" stroke-width="2" />\n`;
        svg += `    <line x1="${ent.width/2}" y1="${-ent.depth/2}" x2="${ent.width/2}" y2="${ent.depth/2}" stroke="${ent.color}" stroke-width="2" />\n`;
        svg += `    <line x1="${-ent.width/2}" y1="0" x2="${ent.width/2}" y2="0" stroke="${ent.color}" stroke-width="1" stroke-dasharray="4 4" />\n`;
        svg += `    <line x1="${-ent.width/2}" y1="0" x2="${-ent.width/2}" y2="${ent.flip ? ent.width : -ent.width}" stroke="${ent.color}" stroke-width="3" stroke-linecap="round" />\n`;
        svg += `    <path d="M ${-ent.width/2},${ent.flip ? ent.width : -ent.width} A ${ent.width} ${ent.width} 0 0 ${ent.flip ? 0 : 1} ${ent.width/2},0" fill="none" stroke="${ent.color}" stroke-width="1" />\n`;
        svg += `  </g>\n`;
      }
    });
    svg += `\n`;
  }

  svg += `  <!-- Entities -->\n`;
  entities.filter(e => !['Room', 'Door', 'Window'].includes(e.kind)).forEach(ent => {
    if (ent.kind === 'Light') {
      svg += `  <g id="${ent.svgId}">\n`;
      if (ent.lightStyle !== 'room') svg += `    <ellipse cx="${ent.x}" cy="${ent.y}" rx="${ent.glowRx}" ry="${ent.glowRy}" class="light-glow" />\n`;
      
      if (ent.customSVG) {
        const size = ent.radius * 2;
        const offset = size / 2;
        svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="light-svg">\n      ${ent.customSVG}\n    </svg>\n`;
      }
      
      svg += `    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else if (ent.kind === 'Fan') {
      const size = ent.radius * 2;
      const offset = size / 2;
      svg += `  <g id="${ent.svgId}">\n    <g class="fan-spin-target" style="--spin-speed: ${ent.spinSpeed}; --spin-dir: ${ent.spinDirection}; transform-origin: ${ent.x}px ${ent.y}px;">\n`;
      if (ent.customSVG) svg += `      <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" style="color: ${ent.color}; fill: currentColor;">\n        ${ent.customSVG}\n      </svg>\n`;
      else svg += `      <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" viewBox="0 0 24 24" style="color: ${ent.color}; fill: none; stroke: currentColor; stroke-width: 2;">\n        <path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/><circle cx="12" cy="12" r="2"/>\n      </svg>\n`;
      svg += `    </g>\n    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else if (ent.kind === 'Lock') {
      const size = ent.radius * 1.5;
      const offset = size / 2;
      svg += `  <g id="${ent.svgId}" style="--locked-color: ${ent.lockedColor || '#000000'}; --unlocked-color: ${ent.unlockedColor || '#22c55e'};">\n`;
      if (ent.customSVG) svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="lock-svg">\n      ${ent.customSVG}\n    </svg>\n`;
      else svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>\n    </svg>\n`;
      svg += `    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else if (ent.kind === 'Outlet') {
      const size = ent.radius * 1.5;
      const offset = size / 2;
      svg += `  <g id="${ent.svgId}" style="--outlet-off-color: ${ent.offColor || '#94a3b8'}; --outlet-on-color: ${ent.onColor || '#22c55e'};">\n`;
      if (ent.customSVG) svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="outlet-svg">\n      ${ent.customSVG}\n    </svg>\n`;
      else svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="outlet-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><circle cx="12" cy="15" r="1"/>\n    </svg>\n`;
      svg += `    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else if (ent.kind === 'Thermostat') {
      const size = ent.radius * 1.5;
      const offset = size / 2;
      svg += `  <g id="${ent.svgId}">\n`;
      if (ent.customSVG) {
         svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="thermostat-svg">\n      ${ent.customSVG}\n    </svg>\n`;
      } else {
         svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" class="thermostat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><path d="M12 7v3"/>\n    </svg>\n`;
      }
      svg += `    <text id="${ent.svgId}_text" x="${ent.x}" y="${ent.y + offset + 12}" class="thermostat-text" font-family="sans-serif" font-size="${ent.radius * 0.5}" font-weight="bold" fill="currentColor" text-anchor="middle">72°</text>\n`;
      svg += `    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else if (ent.kind === 'Garage') {
      const size = ent.radius * 2;
      const offset = size / 2;
      svg += `  <g id="${ent.svgId}">\n`;
      svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" viewBox="0 0 100 100" class="garage-door-closed-svg">\n`;
      svg += `      <path d="M 10 90 L 10 35 L 50 15 L 90 35 L 90 90 Z" fill="none" stroke="#003855" stroke-width="3" stroke-linejoin="round" />\n`;
      svg += `      <rect x="22" y="42" width="56" height="48" fill="none" stroke="#003855" stroke-width="2.5" stroke-linejoin="round" />\n`;
      svg += `      <line x1="22" y1="54" x2="78" y2="54" stroke="#003855" stroke-width="2" />\n`;
      svg += `      <line x1="22" y1="66" x2="78" y2="66" stroke="#003855" stroke-width="2" />\n`;
      svg += `      <line x1="22" y1="78" x2="78" y2="78" stroke="#003855" stroke-width="2" />\n`;
      svg += `      <rect x="27" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" stroke-width="1.5" stroke-linejoin="round" />\n`;
      svg += `      <rect x="44" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" stroke-width="1.5" stroke-linejoin="round" />\n`;
      svg += `      <rect x="61" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" stroke-width="1.5" stroke-linejoin="round" />\n`;
      svg += `    </svg>\n`;
      svg += `    <svg x="${ent.x - offset}" y="${ent.y - offset}" width="${size}" height="${size}" viewBox="0 0 100 100" class="garage-door-open-svg">\n`;
      svg += `      <path d="M 10 90 L 10 35 L 50 15 L 90 35 L 90 90 Z" fill="white" stroke="#003855" stroke-width="3" stroke-linejoin="round" />\n`;
      svg += `      <rect x="28" y="45" width="44" height="35" fill="#0A2D42" stroke="#003855" stroke-width="2" />\n`;
      svg += `      <line x1="22" y1="90" x2="28" y2="80" stroke="#003855" stroke-width="2.5" stroke-linecap="round"/>\n`;
      svg += `      <line x1="78" y1="90" x2="72" y2="80" stroke="#003855" stroke-width="2.5" stroke-linecap="round"/>\n`;
      svg += `      <line x1="28" y1="80" x2="72" y2="80" stroke="#003855" stroke-width="2.5" stroke-linecap="round"/>\n`;
      svg += `      <line x1="28" y1="42" x2="28" y2="80" stroke="#003855" stroke-width="2.5"/>\n`;
      svg += `      <line x1="72" y1="42" x2="72" y2="80" stroke="#003855" stroke-width="2.5"/>\n`;
      svg += `      <rect x="22" y="42" width="56" height="48" fill="none" stroke="#003855" stroke-width="2.5" stroke-linejoin="round" />\n`;
      svg += `      <line x1="25.5" y1="58" x2="25.5" y2="90" stroke="#003855" stroke-width="1.5" />\n`;
      svg += `      <line x1="74.5" y1="58" x2="74.5" y2="90" stroke="#003855" stroke-width="1.5" />\n`;
      svg += `      <polygon points="26,43 74,43 78,48 22,48" fill="white" stroke="#003855" stroke-width="2" stroke-linejoin="round"/>\n`;
      svg += `      <polygon points="29,44.5 41,44.5 42,47 26,47" fill="#1C5D82" stroke="#003855" stroke-width="1.5" stroke-linejoin="round"/>\n`;
      svg += `      <polygon points="44,44.5 56,44.5 56,47 44,47" fill="#1C5D82" stroke="#003855" stroke-width="1.5" strokeLinejoin="round"/>\n`;
      svg += `      <polygon points="59,44.5 71,44.5 74,47 58,47" fill="#1C5D82" stroke="#003855" stroke-width="1.5" strokeLinejoin="round"/>\n`;
      svg += `      <polygon points="22,48 78,48 81,52 19,52" fill="white" stroke="#003855" stroke-width="2" strokeLinejoin="round"/>\n`;
      svg += `      <polygon points="19,52 81,52 83,56 17,56" fill="white" stroke="#003855" stroke-width="2" strokeLinejoin="round"/>\n`;
      svg += `      <polygon points="17,56 83,56 83,60 17,60" fill="white" stroke="#003855" stroke-width="2" strokeLinejoin="round"/>\n`;
      svg += `    </svg>\n`;
      svg += `    <circle cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n  </g>\n`;
    } else {
      svg += `  <circle id="${ent.svgId}" cx="${ent.x}" cy="${ent.y}" r="${ent.radius}" class="entity-hitbox" />\n`;
    }
  });
  svg += `</svg>`;
  return svg;
};

export const generateCss = (entities) => {
  let css = `.entity-hitbox {\n  fill: transparent;\n  cursor: pointer;\n}\n\n.light-glow {\n  opacity: 0;\n  transition: opacity 0.4s ease;\n  mix-blend-mode: screen;\n}\n\n.light-on .light-glow {\n  opacity: 1;\n}\n\n`;
  css += `.room-area {\n  fill: var(--room-off-fill, #000000);\n  opacity: var(--room-off-opacity, 0);\n  transition: opacity 0.4s ease, fill 0.4s ease;\n  mix-blend-mode: var(--room-blend-mode, screen);\n}\n\n`;
  
  const roomTargetLights = entities.filter(e => e.kind === 'Light' && e.lightStyle === 'room' && e.targetRoomId);
  if (roomTargetLights.length > 0) {
    css += `/* Room Area Lighting Rules */\n`;
    roomTargetLights.forEach(light => {
      css += `#${light.targetRoomId}.light-on, svg:has(#${light.svgId}.light-on) #${light.targetRoomId} {\n  fill: var(--room-on-fill);\n  opacity: var(--room-on-opacity);\n}\n`;
    });
    css += `\n`;
  }

  css += `@keyframes spin-cw {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n@keyframes spin-ccw {\n  from { transform: rotate(360deg); }\n  to { transform: rotate(0deg); }\n}\n\n.fan-on .fan-spin-target {\n  animation-name: var(--spin-dir, spin-cw);\n  animation-duration: var(--spin-speed, 2s);\n  animation-timing-function: linear;\n  animation-iteration-count: infinite;\n}\n\n.lock-svg {\n  transition: color 0.3s ease;\n  color: var(--locked-color, #000000);\n}\n\n.lock-unlocked .lock-svg {\n  color: var(--unlocked-color, #22c55e);\n}\n\n`;

  css += `.outlet-svg {\n  transition: color 0.3s ease;\n  color: var(--outlet-off-color, #94a3b8);\n}\n\n.outlet-on .outlet-svg {\n  color: var(--outlet-on-color, #22c55e);\n}\n\n`;
  
  css += `.light-svg {\n  opacity: 0.5;\n  transition: opacity 0.4s ease, color 0.4s ease;\n}\n\n.light-on .light-svg {\n  opacity: 1;\n}\n\n`;

  css += `.garage-door-open-svg {\n  opacity: 0;\n  transition: opacity 0.4s ease;\n}\n\n.garage-door-closed-svg {\n  opacity: 1;\n  transition: opacity 0.4s ease;\n}\n\n.garage-open .garage-door-open-svg {\n  opacity: 1;\n}\n\n.garage-open .garage-door-closed-svg {\n  opacity: 0;\n}\n\n`;

  css += `.thermostat-svg, .thermostat-text {\n  transition: color 0.3s ease;\n  color: #000000;\n}\n\n`;
  css += `.thermostat-heat .thermostat-svg, .thermostat-heat .thermostat-text {\n  color: #ef4444;\n}\n\n`;
  css += `.thermostat-cool .thermostat-svg, .thermostat-cool .thermostat-text {\n  color: #3b82f6;\n}\n`;

  return css;
};