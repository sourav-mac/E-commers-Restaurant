export default function MapEmbed(){
  return (
    <div className="w-full h-64 bg-gray-100 rounded overflow-hidden">
      <iframe
        title="Petuk location"
        className="w-full h-full border-0"
        loading="lazy"
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14824.81555931957!2d88.0874562!3d21.7336199!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0307d05d73373d%3A0xc1dd681af4e124ba!2sPetuk!5e0!3m2!1sen!2sin!4v1765487629591!5m2!1sen!2sin"
      />
    </div>
  )
}
