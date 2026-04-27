import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AboutMatters from './components/AboutMatters'
import Services from './components/Services'
import WhyChooseUs from './components/WhyChooseUs'
import LiveServices from './components/LiveServices'
import MenGrooming from './components/MenGrooming'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Booking from './components/Booking'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-neutral-950 text-white">
      <Navbar />
      <Hero />
      <AboutMatters />
      <Services />
      <WhyChooseUs />
      <LiveServices />
      <MenGrooming />
      <Pricing />
      <Testimonials />
      <Blog />
      <Booking />
      <Footer />
    </div>
  )
}

export default App
