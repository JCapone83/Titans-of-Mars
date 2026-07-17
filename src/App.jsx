import { useEffect, useMemo, useState } from 'react'
import BuildPalette from './components/BuildPalette.jsx'
import CrewRoster from './components/CrewRoster.jsx'
import GuideModal from './components/GuideModal.jsx'
import Inspector from './components/Inspector.jsx'
import ManifestCouncil from './components/ManifestCouncil.jsx'
import MarsFieldGuide from './components/MarsFieldGuide.jsx'
import MarsMap from './components/MarsMap.jsx'
import MissionRail from './components/MissionRail.jsx'
import OutcomeOverlay from './components/OutcomeOverlay.jsx'
import OperationalIncidentCouncil from './components/OperationalIncidentCouncil.jsx'
import RoverDispatch from './components/RoverDispatch.jsx'
import RivalEncounterCouncil from './components/RivalEncounterCouncil.jsx'
import SecondWindowCouncil from './components/SecondWindowCouncil.jsx'
import SponsorCouncil from './components/SponsorCouncil.jsx'
import SponsorEventCouncil from './components/SponsorEventCouncil.jsx'
import SoundtrackControl from './components/SoundtrackControl.jsx'
import TopBar from './components/TopBar.jsx'
import { createInitialState } from './game/initialState.js'
import { advanceSol, applyFollowOnManifest, applyManifest, applyOperationalIncidentChoice, applyRivalEncounterChoice, applySponsorEventChoice, colonyStats, missionObjectives, placeBuilding, repairBuilding, restoreState, updateCrewLead, updateCrossTraining, updateRoverAssignment } from './game/simulation.js'

const SAVE_KEY = 'titans-of-mars-first-city-v1'

function loadState() {
  return restoreState(window.localStorage.getItem(SAVE_KEY)) ?? createInitialState()
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [guideOpen, setGuideOpen] = useState(false)
  const [fieldGuideOpen, setFieldGuideOpen] = useState(false)
  const [roverDispatchOpen, setRoverDispatchOpen] = useState(false)
  const [crewRosterOpen, setCrewRosterOpen] = useState(false)
  const [soundtrackOpen, setSoundtrackOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const stats = useMemo(() => colonyStats(state), [state])
  const objectives = useMemo(() => missionObjectives(state), [state])

  useEffect(() => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!state.manifestId || state.transferWindowPending || state.pendingEventId || state.pendingRivalEncounterId || state.pendingOperationalIncidentId || !state.speed || state.outcome) return undefined
    const timer = window.setInterval(() => setState((current) => advanceSol(current)), Math.max(80, 1000 / state.speed))
    return () => window.clearInterval(timer)
  }, [state.manifestId, state.transferWindowPending, state.pendingEventId, state.pendingRivalEncounterId, state.pendingOperationalIncidentId, state.speed, state.outcome])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!guideOpen && !fieldGuideOpen && !roverDispatchOpen && !crewRosterOpen && !soundtrackOpen) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setGuideOpen(false)
      setFieldGuideOpen(false)
      setRoverDispatchOpen(false)
      setCrewRosterOpen(false)
      setSoundtrackOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [guideOpen, fieldGuideOpen, roverDispatchOpen, crewRosterOpen, soundtrackOpen])

  const handlePlace = (type, col, row) => {
    setState((current) => {
      const result = placeBuilding(current, type, col, row)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleRepair = (uid) => {
    setState((current) => {
      const result = repairBuilding(current, uid)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const resetMission = () => {
    window.localStorage.removeItem(SAVE_KEY)
    setState(createInitialState())
    setNotice('Mission reset to Sol 001.')
  }

  const handleManifest = (manifestId) => {
    setState((current) => {
      const result = applyManifest(current, manifestId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleSponsor = (sponsorId) => {
    setState(createInitialState(sponsorId))
    setNotice('Founding mission authorized.')
  }

  const handleFollowOnManifest = (manifestId) => {
    setState((current) => {
      const result = applyFollowOnManifest(current, manifestId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleSponsorEvent = (choiceId) => {
    setState((current) => {
      const result = applySponsorEventChoice(current, choiceId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleRivalEncounter = (choiceId) => {
    setState((current) => {
      const result = applyRivalEncounterChoice(current, choiceId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleOperationalIncident = (choiceId) => {
    setState((current) => {
      const result = applyOperationalIncidentChoice(current, choiceId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleRoverAssignment = (routeId, delta) => {
    setState((current) => {
      const result = updateRoverAssignment(current, routeId, delta)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleCrossTraining = (role) => {
    setState((current) => {
      const result = updateCrossTraining(current, role)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  const handleCrewLead = (memberId) => {
    setState((current) => {
      const result = updateCrewLead(current, memberId)
      if (result.error) setNotice(result.error)
      return result.state
    })
  }

  return (
    <div className="app-shell">
      <TopBar state={state} stats={stats} musicOpen={soundtrackOpen} onMusic={() => setSoundtrackOpen((current) => !current)} onFieldGuide={() => setFieldGuideOpen(true)} onGuide={() => setGuideOpen(true)} onCrew={() => setCrewRosterOpen(true)} onRovers={() => setRoverDispatchOpen(true)} onReset={resetMission} />
      <SoundtrackControl open={soundtrackOpen} state={state} stats={stats} onClose={() => setSoundtrackOpen(false)} />
      <main className="command-grid">
        <MissionRail state={state} objectives={objectives} />
        <MarsMap
          buildings={state.buildings}
          buildMode={state.buildMode}
          storm={stats.storm || stats.debris}
          network={stats.network}
          sponsorId={state.sponsorId}
          surveyedFeatureIds={state.surveyedFeatureIds}
          settlementName={state.settlementName}
          siteName={state.siteName}
          onPlace={handlePlace}
          onSelect={(uid) => setState((current) => ({ ...current, selectedUid: uid }))}
        />
        <Inspector state={state} stats={stats} onRepair={handleRepair} />
      </main>
      <BuildPalette
        state={state}
        onBuildMode={(buildMode) => setState((current) => ({ ...current, buildMode }))}
        onSpeed={(speed) => setState((current) => ({ ...current, speed }))}
      />
      {notice ? <div className="system-notice" role="status">{notice}</div> : null}
      {!state.sponsorId ? <SponsorCouncil onSelect={handleSponsor} /> : null}
      {state.sponsorId && !state.manifestId ? <ManifestCouncil state={state} onSelect={handleManifest} /> : null}
      {state.transferWindowPending ? <SecondWindowCouncil state={state} onSelect={handleFollowOnManifest} /> : null}
      {state.pendingEventId ? <SponsorEventCouncil eventId={state.pendingEventId} onChoose={handleSponsorEvent} /> : null}
      {state.pendingRivalEncounterId ? <RivalEncounterCouncil sponsorId={state.sponsorId} encounterId={state.pendingRivalEncounterId} onChoose={handleRivalEncounter} /> : null}
      {state.pendingOperationalIncidentId ? <OperationalIncidentCouncil incidentId={state.pendingOperationalIncidentId} onChoose={handleOperationalIncident} /> : null}
      {guideOpen ? <GuideModal onClose={() => setGuideOpen(false)} /> : null}
      {fieldGuideOpen ? <MarsFieldGuide onClose={() => setFieldGuideOpen(false)} /> : null}
      {roverDispatchOpen ? <RoverDispatch state={state} stats={stats} onAssign={handleRoverAssignment} onClose={() => setRoverDispatchOpen(false)} /> : null}
      {crewRosterOpen ? <CrewRoster state={state} stats={stats} onTraining={handleCrossTraining} onLead={handleCrewLead} onClose={() => setCrewRosterOpen(false)} /> : null}
      <OutcomeOverlay outcome={state.outcome} state={state} objectives={objectives} onReset={resetMission} />
    </div>
  )
}
