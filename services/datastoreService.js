import { Datastore } from '@google-cloud/datastore';

import { IS_RUNNING_ON_GOOGLE } from '../config/constants.js';

const datastore = IS_RUNNING_ON_GOOGLE
  ? new Datastore()
  : new Datastore({
      projectId: 'breakerbots-website',
      keyFilename: './datastore.json',
    });

/**
 * Retrieves a list of people from the datastore, excluding entries with the name 'Meeting'.
 *
 * @returns {Promise<Object>} A promise that resolves to an object mapping each person's name to their respective datastore entity.
 */
export async function getPeople() {
  const query = datastore.createQuery('person');
  return datastore
    .runQuery(query)
    .then(([people]) =>
      Object.fromEntries(
        people
          .filter((person) => person[datastore.KEY].name !== 'Meeting')
          .map((person) => [person[datastore.KEY].name, person])
      )
    );
}

/**
 * Updates the datastore entity with the given name with the given data.
 *
 * @param {string} name The name of the person to update.
 * @param {Object} data The new data for the person.
 *
 * @returns {Promise<>} A promise that resolves once the update is complete.
 */
export async function updatePerson(name, data) {
  const key = datastore.key(['person', name]);
  return datastore.update({ key, data });
}
