import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">

      <Header></Header>

      <main className="flex-1">
        <h1>Hello, Next.js! TEST CI CD</h1>
      </main>

      <Footer ></Footer>

    </div>
  )
}