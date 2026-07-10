export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void:'#050810', surface:'#0f1a35', surface2:'#131f3e',
        'cyan-neon':'#00e5ff', hyperblue:'#4078ff', violet:'#a855f7',
        neongreen:'#00ff8c', amber:'#ffb830', danger:'#ff4466'
      },
      fontFamily: {
        display:['Orbitron','sans-serif'],
        body:['Space Grotesk','sans-serif'],
        mono:['JetBrains Mono','monospace']
      },
      animation: {
        'glow':'glow 3s ease-in-out infinite',
        'blink':'blink 1s step-end infinite',
        'pulse-ring':'pulse-ring 2s ease-out infinite'
      },
      keyframes: {
        glow:{'0%,100%':{opacity:'0.4'},'50%':{opacity:'1'}},
        blink:{'0%,100%':{opacity:'1'},'50%':{opacity:'0'}},
        'pulse-ring':{'0%':{transform:'scale(1)',opacity:'1'},'100%':{transform:'scale(1.8)',opacity:'0'}}
      },
      boxShadow: {
        'neon-cyan':'0 0 20px rgba(0,229,255,0.4),0 0 60px rgba(0,229,255,0.1)',
        'neon-red':'0 0 20px rgba(255,68,102,0.4)',
        'neon-green':'0 0 20px rgba(0,255,140,0.4)'
      }
    }
  },
  plugins:[]
};
