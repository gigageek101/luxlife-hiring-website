// Hidden subscriber stories for the Connection simulation. The trainee never sees these;
// the subscriber reveals them only when the Connection Guide method is followed.

export interface ConnectionProfile {
  name: string
  age: number
  job: string
  location: string
  surface: string
  hiddenStory: string
  values: string[]
}

export const CONNECTION_PROFILES: ConnectionProfile[] = [
  {
    name: 'Mike', age: 41, job: 'factory maintenance technician', location: 'Dayton, Ohio',
    surface: 'Tired. Says work is "fine" and "long". Divorced two years ago, does not mention it unless asked what changed.',
    hiddenStory: 'He is the one everyone calls when something breaks, at work and in his family, since he was a teenager. He is proud of it but secretly exhausted; nobody ever asks how HE is doing. The divorce happened because he was never home.',
    values: ['being reliable and needed', 'being seen as a person, not just the fixer', 'quiet time to recharge'],
  },
  {
    name: 'Travis', age: 36, job: 'long-haul truck driver', location: 'Tulsa, Oklahoma',
    surface: 'Short and flat. "On the road." "Same as always." Gets slightly warmer when asked about the road at night.',
    hiddenStory: 'He has two kids (9 and 6) he sees every other weekend. He took the long-haul job for the money and freedom, but the loneliness at night in the truck is heavy and he feels guilty about missing their games.',
    values: ['freedom and the open road', 'being a good dad despite the distance', 'having someone to talk to at night'],
  },
  {
    name: 'Dustin', age: 44, job: 'HVAC technician', location: 'Macon, Georgia',
    surface: 'Polite but closed. "Not much." "Just home." Prefers quiet, says so if asked what home is like.',
    hiddenStory: 'He grew up in a loud, chaotic house with five siblings and learned to hide in the garage. His dad died four months ago; they had just started getting close. He has not really talked about it with anyone.',
    values: ['calm and quiet', 'not having to perform for anyone', 'making things right before it is too late'],
  },
  {
    name: 'Cody', age: 33, job: 'welder', location: 'Dallas, Texas (grew up in a small town in west Texas)',
    surface: 'Guarded. "Small town, you wouldn\'t know it." "It was alright." Warms up when asked why he left.',
    hiddenStory: 'Everyone in his town knew everyone; his family expected him to stay, marry his high-school girlfriend and work at the plant like his dad. He felt trapped, left at 24 and never looked back. He still feels judged when he visits.',
    values: ['freedom and independence', 'deciding his own path', 'being accepted for who he is'],
  },
  {
    name: 'Brandon', age: 39, job: 'construction foreman', location: 'Fort Wayne, Indiana',
    surface: 'Grumpy-short. "Work." "Stressful." Complains about paperwork if asked what makes it stressful.',
    hiddenStory: 'He took the foreman promotion last year for the money and hates it: meetings, paperwork, no tools in his hands. His wife left around the same time. He is thinking about going back to being a regular crew guy but feels like that would be failing.',
    values: ['working with his hands', 'respect from his crew', 'not letting people down'],
  },
  {
    name: 'Scott', age: 47, job: 'farmer', location: 'Billings, Montana',
    surface: 'Stoic. "Fine." "Cows." "Cold." Says a bit more if asked what a day actually looks like.',
    hiddenStory: 'Fourth-generation farmer. His daughter moved to Seattle two years ago and rarely calls; the winters are long and silent. He would never say he is lonely, but he checks his phone every evening hoping someone wrote.',
    values: ['honesty and hard work', 'family staying connected', 'being noticed and appreciated'],
  },
]

export function getConnectionProfile(id: unknown): ConnectionProfile {
  const index = Number.isInteger(Number(id)) ? Number(id) : 0
  return CONNECTION_PROFILES[((index % CONNECTION_PROFILES.length) + CONNECTION_PROFILES.length) % CONNECTION_PROFILES.length]
}
