// @flow
import React, { Fragment, type Node } from 'react';

type Props = {
  children: Node,
};

const DefaultArtboard = ({ children }: Props) => (
  <Fragment>
    {children}
  </Fragment>
);

export default DefaultArtboard;
