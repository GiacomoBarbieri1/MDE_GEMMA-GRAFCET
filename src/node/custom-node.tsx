import { observer } from "mobx-react-lite";
import React from "react";
import { StepType, Step, EnclosingDecoration } from "../step/step";
import {
  AbstractReactFactory,
  AbstractModelFactory,
} from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import {
  LinkModel,
  PortModel,
  DefaultLinkModel,
  PortModelAlignment,
  NodeModel,
  NodeModelGenerics,
  PortWidget,
} from "@projectstorm/react-diagrams";
import styled from "styled-components";

export const CUSTOM_NODE_TYPE = "CUSTOM_NODE_TYPE";

class SimplePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {
  cb: (initialConfig?: any) => PortModel;

  constructor(type: string, cb: (initialConfig?: any) => PortModel) {
    super(type);
    this.cb = cb;
  }

  generateModel(event: any): PortModel {
    return this.cb(event.initialConfig);
  }
}

export const customPortFactory = new SimplePortFactory(
  CUSTOM_NODE_TYPE,
  (config: any) => new CustomPortModel(PortModelAlignment.LEFT)
);

export class CustomPortModel extends PortModel {
  constructor(alignment: PortModelAlignment) {
    super({
      type: CUSTOM_NODE_TYPE,
      name: alignment,
      alignment: alignment,
    });
  }

  createLinkModel(): LinkModel {
    return new DefaultLinkModel();
  }
}

export class CustomNodeFactory extends AbstractReactFactory<
  CustomNodeModel,
  DiagramEngine
> {
  constructor() {
    super(CUSTOM_NODE_TYPE);
  }

  generateReactWidget(event: any): JSX.Element {
    return <CustomNode engine={this.engine} node={event.model} />;
  }

  generateModel(event: any) {
    return new CustomNodeModel(null as any);
  }
}

export interface CustomNodeModelGenerics {
  PORT: CustomPortModel;
}

export class CustomNodeModel extends NodeModel<
  NodeModelGenerics & CustomNodeModelGenerics
> {
  constructor(public readonly step: Step) {
    super({
      type: CUSTOM_NODE_TYPE,
    });
    this.addPort(new CustomPortModel(PortModelAlignment.TOP));
    this.addPort(new CustomPortModel(PortModelAlignment.LEFT));
    this.addPort(new CustomPortModel(PortModelAlignment.BOTTOM));
    this.addPort(new CustomPortModel(PortModelAlignment.RIGHT));
  }
}

export const CustomNode = observer(
  ({ node, engine }: { node: CustomNodeModel; engine: DiagramEngine }) => {
    let style: React.CSSProperties = {};
    let innerStyle: React.CSSProperties = { padding: "12px" };
    let wrapper: (p: React.ReactElement) => React.ReactElement = (p) => p;
    const step = node.step;

    if (step.isInitial) {
      wrapper = (p) => (
        <div style={{ padding: "5px", border: "1.5px solid" }}>
          <div
            style={{
              border: "1.5px solid",
            }}
          >
            {p}
          </div>
        </div>
      );
    }

    const nodeHeight = step.node.height - 2 - (step.isInitial ? 12 : 0);
    switch (step.type) {
      case StepType.ENCLOSING:
        style = { padding: "0 0", display: "flex" };
        return wrapper(
          <div
            style={{ ...style, border: "1.5px solid", position: "relative" }}
          >
            <Ports node={node} engine={engine} size={step.node.height} />
            <EnclosingDecoration left={true} nodeHeight={nodeHeight} />
            <div style={{ ...innerStyle, padding: "12px 18px" }}>
              {step.node.name}
            </div>
            <EnclosingDecoration left={false} nodeHeight={nodeHeight} />
          </div>
        );
      case StepType.MACRO:
        style = { padding: "5px 0" };
        innerStyle = {
          borderTop: "1.5px solid",
          borderBottom: "1.5px solid",
          borderRight: "0",
          borderLeft: "0",
          padding: "5px 12px",
        };
        break;
    }

    return wrapper(
      <div style={{ ...style, border: "1.5px solid", position: "relative" }}>
        <Ports node={node} engine={engine} size={step.node.height} />
        <div style={innerStyle}>{step.node.name}</div>
      </div>
    );
  }
);

const Ports = ({
  engine,
  node,
  size,
}: {
  engine: DiagramEngine;
  node: CustomNodeModel;
  size: number;
}) => {
  return (
    <>
      <PortWidget
        style={{
          top: size / 2 - 8,
          left: -8,
          position: "absolute",
        }}
        port={node.getPort(PortModelAlignment.LEFT)!}
        engine={engine}
      >
        <S.Port />
      </PortWidget>
      <PortWidget
        style={{
          left: size / 2 - 8,
          top: -8,
          position: "absolute",
        }}
        port={node.getPort(PortModelAlignment.TOP)!}
        engine={engine}
      >
        <S.Port />
      </PortWidget>
      <PortWidget
        style={{
          left: size - 8,
          top: size / 2 - 8,
          position: "absolute",
        }}
        port={node.getPort(PortModelAlignment.RIGHT)!}
        engine={engine}
      >
        <S.Port />
      </PortWidget>
      <PortWidget
        style={{
          left: size / 2 - 8,
          top: size - 8,
          position: "absolute",
        }}
        port={node.getPort(PortModelAlignment.BOTTOM)!}
        engine={engine}
      >
        <S.Port />
      </PortWidget>
    </>
  );
};

class S {
  static Port = styled.div`
    width: 16px;
    height: 16px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    cursor: pointer;
    &:hover {
      background: rgba(0, 0, 0, 1);
    }
  `;
}
