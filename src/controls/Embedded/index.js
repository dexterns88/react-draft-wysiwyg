/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils } from 'draft-js';

import LayoutComponent from './Component';

class Embedded extends Component {
  static propTypes: Object = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: Object = {
    expanded: false,
  };

  componentWillMount(): void {
    const { modalHandler } = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent: Function = (): void => {
    this.signalExpanded = !this.state.expanded;
  };

  expandCollapse: Function = (): void => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  }

  doExpand: Function = (): void => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse: Function = (): void => {
    this.setState({
      expanded: false,
    });
  };

  addEmbeddedLink: Function = (embeddedLink, height, width): void => {
    let mutableEmbeddedLink = embeddedLink
    if (embeddedLink.indexOf('youtube') >= 0) {
      mutableEmbeddedLink = mutableEmbeddedLink.replace('watch?v=', 'embed/');
      mutableEmbeddedLink = mutableEmbeddedLink.replace('/watch/', '/embed/');
      mutableEmbeddedLink = mutableEmbeddedLink.replace('youtu.be/', 'youtube.com/embed/');
    } else if (embeddedLink.indexOf('youtu.be/') >= 0) {
      let buildLink = mutableEmbeddedLink.replace('https://', '').replace('http://', '');
      buildLink = buildLink.split('/');
      mutableEmbeddedLink = `https://www.youtube.com/embed/${buildLink[1]}`;
    }
    const { editorState, onChange, config: { embedCallback } } = this.props;
    const src = embedCallback ? embedCallback(mutableEmbeddedLink) : mutableEmbeddedLink;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('EMBEDDED_LINK', 'MUTABLE', { src, height, width })
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' ',
    );
    onChange(newEditorState);
    this.doCollapse();
  };

  render(): Object {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const EmbeddedComponent = config.component || LayoutComponent;
    return (
      <EmbeddedComponent
        config={config}
        translations={translations}
        onChange={this.addEmbeddedLink}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default Embedded;

// todo: make default heights configurable
