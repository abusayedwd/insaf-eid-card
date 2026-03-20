import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ───────── tiny helpers ───────── */
const Star = ({ size = 8, color = "#FFD700", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ opacity, display: "block", flexShrink: 0 }}>
    <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill={color} />
  </svg>
);

/* Fixed DIF logo from public/images/logo.png */
const DIFLogo = () => (
  <img
    src="/images/logo.png"
    alt="Darul Insaf Foundation Logo"
    style={{ width: "100%", height: "100%", objectFit: "contain" }}
  />
);

const CrescentMoon = () => (
  <svg viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <radialGradient id="mg" cx="38%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#FFFACD" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" stopOpacity="0.3" />
      </radialGradient>
      <filter id="mf"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="48" cy="50" r="34" fill="rgba(255,215,0,0.07)" />
    <circle cx="48" cy="50" r="26" fill="rgba(255,215,0,0.05)" />
    <path d="M48,22 A28,28 0 1,1 48,78 A19,19 0 1,0 48,22Z" fill="url(#mg)" filter="url(#mf)" />
    <polygon points="76,20 77.8,26 84,26 79,29.5 81,35.5 76,32 71,35.5 73,29.5 68,26 74.2,26" fill="#FFFACD" filter="url(#mf)" />
  </svg>
);

const Mosque = () => (
  <svg viewBox="0 0 560 80" width="100%" height="80" preserveAspectRatio="xMidYMax meet">
    <defs>
      <linearGradient id="mosG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0.03" />
      </linearGradient>
    </defs>
    <rect x="18" y="20" width="11" height="60" rx="2" fill="url(#mosG)" />
    <ellipse cx="23" cy="19" rx="8" ry="11" fill="url(#mosG)" />
    <rect x="531" y="20" width="11" height="60" rx="2" fill="url(#mosG)" />
    <ellipse cx="537" cy="19" rx="8" ry="11" fill="url(#mosG)" />
    <rect x="108" y="34" width="9" height="46" rx="2" fill="url(#mosG)" />
    <ellipse cx="112" cy="33" rx="6" ry="9" fill="url(#mosG)" />
    <rect x="443" y="34" width="9" height="46" rx="2" fill="url(#mosG)" />
    <ellipse cx="448" cy="33" rx="6" ry="9" fill="url(#mosG)" />
    <path d="M135,80 L135,58 Q170,32 205,58 L205,80Z" fill="url(#mosG)" />
    <path d="M355,80 L355,58 Q390,32 425,58 L425,80Z" fill="url(#mosG)" />
    <path d="M183,80 L183,50 Q280,2 377,50 L377,80Z" fill="url(#mosG)" />
    <rect x="0" y="78" width="560" height="2" rx="1" fill="rgba(255,215,0,0.1)" />
  </svg>
);

/* wavy ornament line */
const WaveLine = ({ flip = false }) => (
  <svg viewBox="0 0 200 18" width="100%" height="18" style={{ transform: flip ? "scaleX(-1)" : "none" }}>
    <defs>
      <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
        <stop offset="50%" stopColor="#FFD700" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0,9 Q25,2 50,9 Q75,16 100,9 Q125,2 150,9 Q175,16 200,9"
      fill="none" stroke="url(#wg)" strokeWidth="1.5" />
  </svg>
);

/* ───────── main component ───────── */
export default function EidCard() {
  const cardRef  = useRef(null);
  const photoRef = useRef(null);

  const [name,        setName]        = useState("");
  const [photo,       setPhoto]       = useState(null);
  const [downloading, setDownloading] = useState(false);  // "pdf" | "img" | false

  const readFile = (file, setter) => {
    const r = new FileReader();
    r.onloadend = () => setter(r.result);
    r.readAsDataURL(file);
  };

  const getCanvas = async () => {
    await document.fonts.ready;
    return html2canvas(cardRef.current, {
      scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
    });
  };

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      const canvas  = await getCanvas();
      const imgData = canvas.toDataURL("image/png");
      // Use exact card aspect ratio — no white gaps
      const PX_PER_MM = canvas.width / 105; // 105mm wide (A5-ish)
      const mmW = 105;
      const mmH = Math.round((canvas.height / canvas.width) * mmW);
      const pdf = new jsPDF({
        orientation: mmH > mmW ? "portrait" : "landscape",
        unit: "mm",
        format: [mmW, mmH],
      });
      pdf.addImage(imgData, "PNG", 0, 0, mmW, mmH);
      pdf.save(`eid-card${name ? "-" + name.replace(/\s+/g, "-") : ""}.pdf`);
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const downloadImage = async () => {
    setDownloading("img");
    try {
      const canvas = await getCanvas();
      const link   = document.createElement("a");
      link.download = `eid-card${name ? "-" + name.replace(/\s+/g, "-") : ""}.png`;
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  /* shared glass style for control buttons */
  const glassBtn = (active) => ({
    flex: 1,
    padding: "14px 10px",
    borderRadius: "14px",
    background: active ? "rgba(255,215,0,0.14)" : "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,215,0,0.22)",
    color: "#FFD700",
    fontSize: "13px",
    fontFamily: "'Noto Serif Bengali',serif",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
    transition: "all .2s",
    boxSizing: "border-box",
  });

  const primaryBtn = (loading) => ({
    flex: 1,
    padding: "14px 10px",
    borderRadius: "14px",
    border: "none",
    background: loading
      ? "rgba(255,215,0,0.18)"
      : "linear-gradient(135deg,#FFD700 0%,#FFA000 100%)",
    color: loading ? "#555" : "#080c1a",
    fontSize: "13px",
    fontWeight: 700,
    fontFamily: "'Noto Serif Bengali',serif",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: loading ? "none" : "0 4px 20px rgba(255,160,0,0.38)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
    transition: "all .2s",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg,#080b18 0%,#0f0820 45%,#071410 100%)",
      padding: "28px 16px 60px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "7px", marginBottom: "8px" }}>
          {[8,12,8].map((s,i) => <Star key={i} size={s} color="#FFD700" opacity={i===1?1:.5} />)}
        </div>
        <h1 style={{
          fontSize: "clamp(20px,5vw,28px)", fontWeight: 700,
          color: "#FFD700", fontFamily: "'Noto Serif Bengali',serif",
          margin: 0, textShadow: "0 0 28px rgba(255,215,0,0.4)",
        }}>ঈদ কার্ড তৈরি করুন</h1>
        <p style={{ color: "#5a4828", fontSize: "13px", marginTop: "4px", fontFamily: "'Noto Serif Bengali',serif" }}>
          Darul Insaf Foundation · ঈদ উল ফিতর ১৪৪৬
        </p>
      </div>

      {/* ═══════════════ CARD ═══════════════ */}
      <div ref={cardRef} style={{
        width: "100%", maxWidth: "560px",
        background: "linear-gradient(155deg,#0b1a40 0%,#160b35 28%,#0a2018 60%,#1a1608 100%)",
        borderRadius: "22px", overflow: "hidden", position: "relative",
        boxShadow:
          "0 0 0 1.5px rgba(255,215,0,0.22)," +
          "0 0 70px rgba(255,165,0,0.1)," +
          "0 40px 100px rgba(0,0,0,0.7)",
        fontFamily: "'Noto Serif Bengali',serif",
      }}>

        {/* ── 4-side gold borders ── */}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"2.5px",
          background:"linear-gradient(90deg,transparent,#FFD700 28%,#FFC200 50%,#FFD700 72%,transparent)" }} />
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"2.5px",
          background:"linear-gradient(90deg,transparent,#FFD700 28%,#FFC200 50%,#FFD700 72%,transparent)" }} />
        <div style={{ position:"absolute",top:0,left:0,bottom:0,width:"2.5px",
          background:"linear-gradient(180deg,transparent,#FFD700 28%,#FFC200 50%,#FFD700 72%,transparent)" }} />
        <div style={{ position:"absolute",top:0,right:0,bottom:0,width:"2.5px",
          background:"linear-gradient(180deg,transparent,#FFD700 28%,#FFC200 50%,#FFD700 72%,transparent)" }} />

        {/* dot texture */}
        <div style={{
          position:"absolute",inset:0,pointerEvents:"none",opacity:.032,
          backgroundImage:"radial-gradient(circle,#FFD700 1px,transparent 1px)",
          backgroundSize:"24px 24px",
        }} />

        {/* center glow */}
        <div style={{
          position:"absolute",top:"45%",left:"50%",transform:"translate(-50%,-50%)",
          width:"75%",height:"75%",pointerEvents:"none",
          background:"radial-gradient(ellipse,rgba(255,215,0,0.04) 0%,transparent 70%)",
        }} />

        {/* scattered stars */}
        {[
          {t:"5%",l:"5%",s:7,o:.55},{t:"3%",l:"25%",s:4,o:.3},{t:"7%",l:"60%",s:5,o:.38},
          {t:"4%",r:"6%",s:8,o:.6},{t:"22%",l:"2.5%",s:4,o:.28},{t:"50%",r:"2.5%",s:4,o:.28},
          {t:"70%",l:"3%",s:5,o:.32},{t:"78%",r:"4%",s:6,o:.38},
        ].map((p,i)=>(
          <div key={i} style={{position:"absolute",top:p.t,left:p.l,right:p.r,pointerEvents:"none"}}>
            <Star size={p.s} color="#FFD700" opacity={p.o} />
          </div>
        ))}

        {/* crescent – top right */}
        <div style={{position:"absolute",top:"-8px",right:"-8px",pointerEvents:"none",opacity:.92}}>
          <CrescentMoon />
        </div>

        {/* mosque – bottom */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,pointerEvents:"none"}}>
          <Mosque />
        </div>

        {/* ── HEADER BAND ── */}
        <div style={{
          position:"relative",zIndex:2,
          display:"flex",alignItems:"center",gap:"12px",
          padding:"12px 18px 10px",
          background:"rgba(0,0,0,0.28)",
          borderBottom:"1px solid rgba(255,215,0,0.1)",
        }}>
          {/* fixed logo */}
          <div style={{
            width:50,height:50,borderRadius:"10px",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(255,255,255,0.06)",
            border:"1.5px solid rgba(255,215,0,0.3)",
            boxShadow:"0 0 20px rgba(255,215,0,0.1)",
            overflow:"hidden",
            padding:"4px",
          }}>
            <DIFLogo />
          </div>

          <div style={{flex:1}}>
            <p style={{
              fontSize:"clamp(10.5px,2.6vw,12.5px)",fontWeight:700,
              letterSpacing:"1.8px",color:"#FFD700",textTransform:"uppercase",
              margin:"0 0 1px",lineHeight:1.3,
            }}>DARUL INSAF FOUNDATION</p>
            <p style={{
              fontSize:"clamp(10.5px,2.6vw,12.5px)",color:"#a08050",
              fontFamily:"'Noto Serif Bengali',serif",margin:"0 0 3px",lineHeight:1.3,
            }}>দারুল ইনসাফ ফাউন্ডেশন</p>
            <p style={{
              fontSize:"clamp(9.5px,2.3vw,11px)",
              color:"rgba(255,215,0,0.5)",
              fontFamily:"'Noto Serif Bengali',serif",
              fontStyle:"italic",
              margin:0,lineHeight:1.3,
              letterSpacing:"0.3px",
            }}>মানবতার সেবায়, ইনসাফের পথে।</p>
          </div>

          <div style={{textAlign:"right",flexShrink:0}}>
            <p style={{fontFamily:"'Amiri',serif",fontSize:"clamp(10px,2.4vw,12px)",color:"rgba(255,215,0,0.5)",margin:"0 0 1px"}}>
              ঈদ উল ফিতর
            </p>
            <p style={{fontFamily:"'Amiri',serif",fontSize:"clamp(10px,2.4vw,12px)",color:"rgba(255,215,0,0.35)",margin:0}}>
              ১৪৪৬ হিজরি
            </p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{position:"relative",zIndex:2,padding:"18px 20px 96px"}}>

          {/* Bismillah */}
          <p style={{
            fontFamily:"'Amiri',serif",fontSize:"clamp(14px,3.5vw,18px)",
            color:"rgba(255,215,0,0.72)",textAlign:"center",
            letterSpacing:"1px",marginBottom:"10px",
          }}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>

          {/* Arabic main title */}
          <h1 style={{
            fontFamily:"'Amiri',serif",
            fontSize:"clamp(38px,9.5vw,56px)",
            fontWeight:700,color:"#FFD700",
            lineHeight:1.15,textAlign:"center",margin:"0 0 4px",
            textShadow:"0 0 50px rgba(255,215,0,0.55),0 2px 12px rgba(0,0,0,0.6)",
          }}>عِيدٌ مُبَارَكٌ</h1>

          {/* ornament row */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",margin:"4px 0 10px"}}>
            <div style={{flex:1}}><WaveLine /></div>
            <Star size={13} color="#FFD700" />
            <div style={{flex:1}}><WaveLine flip /></div>
          </div>

          {/* Bengali title */}
          <h2 style={{
            fontFamily:"'Noto Serif Bengali',serif",
            fontSize:"clamp(26px,7vw,38px)",
            fontWeight:700,color:"#ffffff",
            textAlign:"center",margin:"0 0 2px",
            textShadow:"0 0 28px rgba(255,215,0,0.3)",
          }}>ঈদ মুবারক</h2>

          <p style={{
            color:"#6a5030",fontSize:"clamp(11px,2.6vw,13px)",
            fontFamily:"'Noto Serif Bengali',serif",
            textAlign:"center",marginBottom:"18px",
          }}>ঈদ উল ফিতর — ১৪৪৬ হিজরি</p>

          {/* ── CONTENT ROW ── */}
          <div style={{display:"flex",gap:"16px",alignItems:"flex-start"}}>

            {/* LEFT – profile photo */}
            <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <div
                onClick={() => photoRef.current?.click()}
                title="ছবি পরিবর্তন করুন"
                style={{
                  width:"clamp(110px,27vw,135px)",
                  height:"clamp(142px,35vw,174px)",
                  borderRadius:"16px 16px 56px 16px",
                  overflow:"hidden",cursor:"pointer",flexShrink:0,
                  border:"2px solid rgba(255,215,0,0.42)",
                  background:"rgba(255,215,0,0.04)",
                  boxShadow:"0 0 0 5px rgba(255,215,0,0.06),8px 8px 32px rgba(0,0,0,0.55)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  position:"relative",transition:"box-shadow .2s",
                }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 0 5px rgba(255,215,0,0.12),8px 8px 32px rgba(0,0,0,0.55)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 0 5px rgba(255,215,0,0.06),8px 8px 32px rgba(0,0,0,0.55)"}
              >
                {photo
                  ? <img src={photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="profile" />
                  : <div style={{textAlign:"center",padding:"14px"}}>
                      <div style={{fontSize:"30px",marginBottom:"6px"}}>📷</div>
                      <p style={{color:"#6a5030",fontSize:"10px",fontFamily:"'Noto Serif Bengali',serif",lineHeight:1.6}}>
                        ছবি<br/>যোগ করুন
                      </p>
                    </div>
                }
                {/* corner accent */}
                <div style={{
                  position:"absolute",bottom:"6px",right:"6px",
                  width:"22px",height:"22px",
                  borderTop:"2px solid rgba(255,215,0,0.55)",
                  borderLeft:"2px solid rgba(255,215,0,0.55)",
                  borderRadius:"0 0 0 6px",
                  transform:"rotate(180deg)",
                  pointerEvents:"none",
                }} />
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>e.target.files[0]&&readFile(e.target.files[0],setPhoto)} />

              {/* name badge under photo */}
              {name && (
                <div style={{
                  padding:"5px 10px",borderRadius:"9px",
                  background:"rgba(255,215,0,0.07)",
                  border:"1px solid rgba(255,215,0,0.2)",
                  maxWidth:"clamp(110px,27vw,135px)",width:"100%",
                  textAlign:"center",boxSizing:"border-box",
                }}>
                  <p style={{
                    color:"#fff",fontSize:"clamp(11px,2.8vw,13px)",
                    fontFamily:"'Noto Serif Bengali',serif",fontWeight:600,
                    margin:0,wordBreak:"break-word",
                    textShadow:"0 0 10px rgba(255,215,0,0.28)",
                  }}>{name}</p>
                </div>
              )}
            </div>

            {/* RIGHT – wishes */}
            <div style={{flex:1,paddingTop:"2px"}}>
              {/* Arabic dua box */}
              <div style={{
                padding:"10px 12px",borderRadius:"12px",marginBottom:"10px",
                background:"rgba(255,215,0,0.05)",
                border:"1px solid rgba(255,215,0,0.14)",
              }}>
                <p style={{
                  fontFamily:"'Amiri',serif",
                  fontSize:"clamp(12px,3vw,15px)",
                  color:"rgba(255,215,0,0.78)",
                  textAlign:"center",margin:"0 0 4px",letterSpacing:"0.5px",lineHeight:1.8,
                }}>تَقَبَّلَ اللّٰهُ مِنَّا وَمِنْكُمْ</p>
                <p style={{
                  color:"#6a5030",fontSize:"clamp(9px,2.2vw,10.5px)",
                  fontFamily:"'Noto Serif Bengali',serif",
                  textAlign:"center",margin:0,lineHeight:1.6,
                }}>আল্লাহ আমাদের ও আপনাদের আমল কবুল করুন</p>
              </div>

              {/* Eid wishes message */}
              <p style={{
                color:"#c4a870",fontSize:"clamp(11px,2.8vw,13px)",
                fontFamily:"'Noto Serif Bengali',serif",
                lineHeight:1.8,margin:"0 0 8px",
              }}>
                এই পবিত্র ঈদুল ফিতরের শুভ মুহূর্তে আপনার ও পরিবারের জন্য আল্লাহর অফুরন্ত রহমত ও বরকত কামনা করি।
              </p>
              <p style={{
                color:"#7a6040",fontSize:"clamp(10px,2.5vw,12px)",
                fontFamily:"'Noto Serif Bengali',serif",
                lineHeight:1.75,margin:0,
              }}>
                এই ঈদ আপনার জীবনে সুখ, শান্তি ও সমৃদ্ধি নিয়ে আসুক।
              </p>

              <div style={{display:"flex",gap:"5px",marginTop:"10px",alignItems:"center"}}>
                {[5,8,5].map((s,i)=><Star key={i} size={s} color="#FFD700" opacity={i===1?.65:.3} />)}
              </div>
            </div>
          </div>

          {/* divider */}
          <div style={{
            height:"1px",margin:"14px 0 12px",
            background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.18) 30%,rgba(255,215,0,0.18) 70%,transparent)",
          }} />

          {/* bottom Arabic blessing */}
          <div style={{
            padding:"10px 16px",borderRadius:"12px",textAlign:"center",
            background:"rgba(0,0,0,0.22)",
            border:"1px solid rgba(255,215,0,0.1)",
            marginBottom:"14px",
          }}>
            <p style={{
              fontFamily:"'Amiri',serif",
              fontSize:"clamp(12px,3vw,15px)",
              color:"rgba(255,215,0,0.6)",margin:"0 0 3px",letterSpacing:"1px",
            }}>كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ</p>
            <p style={{
              color:"#5a4020",fontFamily:"'Noto Serif Bengali',serif",
              fontSize:"clamp(10px,2.4vw,11px)",margin:0,
            }}>প্রতিটি বছর আপনি ভালো থাকুন</p>
          </div>

          {/* ── FOOTER: foundation + slogan ── */}
          <div style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",
            padding:"10px 16px",borderRadius:"12px",
            background:"rgba(255,215,0,0.04)",
            border:"1px solid rgba(255,215,0,0.14)",
          }}>
            {/* thin gold line top */}
            <div style={{
              width:"120px",height:"1px",marginBottom:"6px",
              background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.4),transparent)",
            }} />

            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <Star size={6} color="#FFD700" opacity={0.5} />
              <p style={{
                fontSize:"clamp(10px,2.5vw,12px)",fontWeight:700,
                letterSpacing:"1.8px",color:"#FFD700",textTransform:"uppercase",
                margin:0,lineHeight:1.3,
              }}>DARUL INSAF FOUNDATION</p>
              <Star size={6} color="#FFD700" opacity={0.5} />
            </div>

            <p style={{
              fontSize:"clamp(10px,2.5vw,12px)",color:"#8a6a38",
              fontFamily:"'Noto Serif Bengali',serif",
              margin:0,lineHeight:1.3,
            }}>দারুল ইনসাফ ফাউন্ডেশন</p>

            <p style={{
              fontSize:"clamp(10px,2.4vw,12px)",
              color:"rgba(255,215,0,0.45)",
              fontFamily:"'Noto Serif Bengali',serif",
              fontStyle:"italic",
              margin:"2px 0 0",lineHeight:1.3,
              letterSpacing:"0.3px",
            }}>মানবতার সেবায়, ইনসাফের পথে।</p>

            <div style={{
              width:"80px",height:"1px",marginTop:"6px",
              background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.3),transparent)",
            }} />
          </div>

        </div>
      </div>

      {/* ═══════════════ CONTROLS ═══════════════ */}
      <div style={{
        width:"100%",maxWidth:"560px",marginTop:"26px",
        display:"flex",flexDirection:"column",gap:"14px",
      }}>

        {/* name input */}
        <div>
          <label style={{
            display:"block",color:"#6a5030",fontSize:"13px",
            marginBottom:"6px",fontFamily:"'Noto Serif Bengali',serif",
          }}>আপনার নাম লিখুন</label>
          <input
            type="text" value={name} onChange={e=>setName(e.target.value)}
            placeholder="নাম লিখুন…"
            style={{
              width:"100%",padding:"13px 16px",borderRadius:"14px",boxSizing:"border-box",
              background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,215,0,0.18)",
              color:"#fff",fontSize:"16px",fontFamily:"'Noto Serif Bengali',serif",
              outline:"none",transition:"border-color .2s",
            }}
            onFocus={e=>e.target.style.borderColor="rgba(255,215,0,0.6)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,215,0,0.18)"}
          />
        </div>

        {/* photo upload */}
        <button
          onClick={()=>photoRef.current?.click()}
          style={{...glassBtn(!!photo),width:"100%"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,215,0,0.12)"}
          onMouseLeave={e=>e.currentTarget.style.background=photo?"rgba(255,215,0,0.14)":"rgba(255,255,255,0.04)"}
        >
          <span style={{fontSize:"18px"}}>{photo?"✅":"📷"}</span>
          <span>{photo?"প্রোফাইল ছবি পরিবর্তন করুন":"প্রোফাইল ছবি আপলোড করুন"}</span>
        </button>

        {/* download row */}
        <div style={{display:"flex",gap:"12px"}}>

          {/* image download */}
          <button
            onClick={downloadImage}
            disabled={!!downloading}
            style={primaryBtn(downloading==="img")}
            onMouseEnter={e=>{ if(!downloading) e.currentTarget.style.boxShadow="0 6px 30px rgba(255,160,0,0.55)"; }}
            onMouseLeave={e=>{ if(!downloading) e.currentTarget.style.boxShadow="0 4px 20px rgba(255,160,0,0.38)"; }}
          >
            <span style={{fontSize:"18px"}}>{downloading==="img"?"⏳":"🖼"}</span>
            <span>{downloading==="img"?"তৈরি হচ্ছে…":"ছবি ডাউনলোড"}</span>
          </button>

          {/* pdf download */}
          <button
            onClick={downloadPDF}
            disabled={!!downloading}
            style={{
              ...primaryBtn(downloading==="pdf"),
              background: downloading==="pdf"
                ? "rgba(255,215,0,0.18)"
                : "linear-gradient(135deg,#e65100 0%,#bf360c 100%)",
              boxShadow: downloading==="pdf" ? "none" : "0 4px 20px rgba(230,81,0,0.4)",
              color: downloading==="pdf" ? "#555" : "#fff",
            }}
            onMouseEnter={e=>{ if(!downloading) e.currentTarget.style.boxShadow="0 6px 30px rgba(230,81,0,0.6)"; }}
            onMouseLeave={e=>{ if(!downloading) e.currentTarget.style.boxShadow="0 4px 20px rgba(230,81,0,0.4)"; }}
          >
            <span style={{fontSize:"18px"}}>{downloading==="pdf"?"⏳":"📄"}</span>
            <span>{downloading==="pdf"?"তৈরি হচ্ছে…":"PDF ডাউনলোড"}</span>
          </button>
        </div>

        <p style={{
          textAlign:"center",color:"rgba(90,70,30,0.55)",
          fontSize:"12px",fontFamily:"'Noto Serif Bengali',serif",margin:0,
        }}>
          কার্ডের ছবিতে ক্লিক করেও প্রোফাইল ছবি পরিবর্তন করা যাবে
        </p>
      </div>
    </div>
  );
}
