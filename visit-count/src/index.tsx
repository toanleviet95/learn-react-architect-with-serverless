import React from 'react';
import { GraphQLString } from 'graphql';
import { Query } from 'react-apollo';
import {
    DataLayer,
    Entry,
    Environment,
    Route,
    IsomorphicApp,
    Middleware,
    serviceWithDataLayer,
    update,
    WebApp,
    withDataLayer,
    EnvValue
} from "infrastructure-components";

import { utcstring, setDate } from './utils';

export default (
    <IsomorphicApp
        stackName = "visit-count"
        buildPath = 'build'
        assetsPath='assets'
        region='ap-southeast-1'>
            <Environment
                name="dev"
            >
                <EnvValue name="MY_VARIABLE" value="hello world" />
            </Environment>

            <DataLayer id='datalayer'>
                <Entry
                    id='visitentry'
                    primaryKey='visittimestamp'
                    data={{ visitcount: GraphQLString }}
                />
                <WebApp
                    id='main'
                    path='*'
                    method='GET'
                >
                    <Route
                        path='/'
                        name='React-Architect'
                        render={withDataLayer(props => {
                            return (
                                <div>
                                    <Query {...props.getEntryScanQuery('visitentry', {
                                        visittimestamp: [
                                            utcstring(setDate(new Date(), 0)),
                                            utcstring(setDate(new Date(), 23))
                                        ]
                                    })}>
                                        {
                                            (loading, data, error) => {
                                                return (
                                                    loading && <div>Calculating...</div>
                                                ) || (
                                                    data && <div>
                                                        Total visitors today: {
                                                            data['scan_visitentry_visittimestamp'].reduce(
                                                                (total, entry) => total + parseInt(entry.visitcount), 0
                                                            )
                                                        }
                                                    </div>
                                                ) || (
                                                    <div>Error loading data</div>
                                                )
                                            }
                                        }
                                    </Query> 
                                </div>
                            )
                        })}
                    >
                        <Middleware
                            callback={
                                serviceWithDataLayer(
                                    async function (dataLayer, req, res, next) {
                                        await update(
                                            dataLayer.client,
                                            dataLayer.updateEntryQuery('visitentry', data => ({
                                                visittimestamp: utcstring(new Date()),
                                                visitcount: data.visitcount ? parseInt(data.visitcount) + 1 : 1
                                            }))
                                        );
                                        next();
                                    }
                                )
                            }
                        />
                    </Route>
                </WebApp>
            </DataLayer>
    </IsomorphicApp>
);
