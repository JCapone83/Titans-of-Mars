import { X } from 'lucide-react'

export default function GuideModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <button className="modal-close" onClick={onClose} title="Close guide" aria-label="Close guide"><X /></button>
        <h1 id="guide-title">Mission Guide</h1>
        <p>Your transfer vehicle is not a permanent home. Establish local life support and storm-resilient power before the dust front reaches the colony on Sol 18.</p>
        <ol>
          <li>Choose a founding sponsor, then commit one of its transfer doctrines.</li>
          <li>Select a structure from the Build dock.</li>
          <li>Choose a blue diamond within two cells of the connected utility grid.</li>
          <li>Place ice rigs on cyan survey lenses; amber ridge cells increase solar output.</li>
          <li>Watch imported cargo, parts and grid reserve.</li>
          <li>Dispatch the two surface rovers between ice haul, construction support, and maintenance patrols.</li>
          <li>Use crew cross-training to reinforce engineering, surface operations, or medical and civic support.</li>
          <li>Build a habitat, ice rig, oxygen plant and resilient power source before starting time.</li>
          <li>Sponsor crises on Sol 12 and Sol 30 pause time until you issue a permanent command decision.</li>
          <li>During expansion, relations and strategic position with another settlement shape the final Mars order.</li>
          <li>Dust and debris can damage structures. Select degraded equipment and authorize repairs from its inspector.</li>
        </ol>
        <p>Only grid-linked structures operate or satisfy objectives. Cyan lines show the active network. The campaign is saved automatically in this browser; a strong Sol 24 review opens a second transfer window and the permanent-city audit follows on Sol 42.</p>
        <button className="primary-command" onClick={onClose}>Return to command</button>
      </section>
    </div>
  )
}
