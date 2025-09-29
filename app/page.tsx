export default function Home() {
  return (
    <main>
      <section style={{padding:"80px 20px", textAlign:"center"}}>
        <h1 style={{fontSize:"40px", fontWeight:600}}>감정을 이해하는 AI, 소울라이즈</h1>
        <p style={{marginTop:16}}>블로그와 뉴스는 아래에서 확인하세요.</p>
        <div style={{marginTop:24, display:"flex", gap:12, justifyContent:"center"}}>
          <a href="/blog" style={{padding:"12px 20px", border:"1px solid #222", borderRadius:10}}>블로그 보기</a>
          <a href="https://www.eora.life" target="_blank" style={{padding:"12px 20px", background:"#000", color:"#fff", borderRadius:10}}>eora 상담 시작</a>
        </div>
      </section>
    </main>
  );
}
