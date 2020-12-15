import { Signal } from "./signal";
import { macroStepBehaviour } from "./macro-step";
import { EnclosingStep, MacroStep, StepType } from "./step";
import { GemmaGrafcet } from "./gemma";
import { gemmaBehaviour, memoryTransitionSuffix } from "./gemma-templates";

const variableDefinition = (signal: Signal): string => {
  return `\
<variable name="${signal.name}">
  <type>
    <${signal.type.toUpperCase()} />
  </type>
  ${
    signal.defaultValue.length > 0
      ? `<initialValue>
    <simpleValue value="${signal.defaultValue}" />
  </initialValue>
`
      : ""
  }\
</variable>`;
};

const objectIdData = (objectId: string): string => {
  return `\
<data name="http://www.3s-software.com/plcopenxml/objectid" handleUnknown="discard">
  <ObjectId>${objectId}</ObjectId>
</data> 
`;
};

const functionBlock = (step: MacroStep | EnclosingStep): string => {
  return `\
<data name="http://www.3s-software.com/plcopenxml/pou" handleUnknown="implementation">
  <pou name="${step.name}_FB" pouType="functionBlock">
    <interface>
      <inputVars>
        <variable name="Initialization">
          <type>
            <BOOL />
          </type>
        </variable>
      </inputVars>
      <outputVars>
        <variable name="Complete">
          <type>
            <BOOL />
          </type>
        </variable>
      </outputVars>
    </interface>
    <body>
      <ST>
        <xhtml xmlns="http://www.w3.org/1999/xhtml">
      ${macroStepBehaviour(step)}
        </xhtml>
      </ST>
    </body>
    <addData>
      ${objectIdData(step.key)}
    </addData>
  </pou>
</data>
`;
};

const gemmaImplementation = (gemma: GemmaGrafcet): string => {
  return `\
<data name="http://www.3s-software.com/plcopenxml/pou" handleUnknown="implementation">
  <pou name="GEMMA" pouType="program">
    <interface>
      <localVars>
        <variable name="State">
          <type>
            <UINT />
          </type>
          <initialValue>
            <simpleValue value="${gemma.initialStep?.id}" />
          </initialValue>
        </variable>
        <variable name="Entry">
          <type>
            <BOOL />
          </type>
          <initialValue>
            <simpleValue value="TRUE" />
          </initialValue>
        </variable>
        ${gemma.steps
          .filter(
            (s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO
          )
          .map(
            (s) => `\
          <variable name="${s.name}">
          <type>
            <derived name="${s.name}_FB" />
          </type>
          </variable>`
          )
          .join("\n")}
        ${gemma.steps
          .filter(
            (s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO
          )
          .flatMap((s) => s.transitions)
          .flatMap((t) =>
            t.signalsWithMemory.map((sm) => {
              const assign = sm.behaviour === "NO" ? "FALSE" : "TRUE";
              return `\
              <variable name="${sm.value}${memoryTransitionSuffix(t)}">
              <type>
                <BOOL />
              </type>
              <initialValue>
                <simpleValue value="${assign}" />
              </initialValue>
              </variable>`;
            })
          )
          .join("    \n")}
      </localVars>
    </interface>
    <body>
      <ST>
        <xhtml xmlns="http://www.w3.org/1999/xhtml">
      ${gemmaBehaviour(gemma)}
        </xhtml>
      </ST>
    </body>
    <addData>
      ${objectIdData(gemma.key)}
    </addData>
  </pou>
</data>
`;
};

export const projectTemplate = (gemma: GemmaGrafcet): string => {
  return `\
<?xml version="1.0" encoding="utf-8"?>
<project xmlns="http://www.plcopen.org/xml/tc6_0200">
  ${projectHeader()}
  <instances>
    <configurations>
      <configuration name="Device">
        <resource name="Application">
          ${tasks()}
          <globalVars name="GVL">
            ${gemma.signals.map(variableDefinition).join("      \n")}
            <addData>
              <data name="http://www.3s-software.com/plcopenxml/attributes" handleUnknown="implementation">
                <Attributes>
                  <Attribute Name="qualified_only" Value="" />
                </Attributes>
              </data>
              ${objectIdData("ea459247-8ebb-40c6-ae2a-b2c7106e0e22")}
            </addData>
          </globalVars>
          <addData>
            ${gemmaImplementation(gemma)}
            ${gemma.steps
              .filter(
                (s) =>
                  s.type === StepType.ENCLOSING || s.type === StepType.MACRO
              )
              .map((s) => functionBlock(s as MacroStep | EnclosingStep))
              .join("\n")}
            ${libraries()}
            ${objectIdData("f1bdda63-82df-4380-babf-520f8e0395d3")}
          </addData>
        </resource>
        <addData>
          ${device(gemma.codesysVersion)}
          <data name="configurations" handleUnknown="discard">
            <configurations />
          </data>
          ${objectIdData("a8da5055-ba3c-41dd-853b-ad72125a9af2")}
        </addData>
      </configuration>
    </configurations>
  </instances>
  <addData>
    ${projectStructure(gemma)}
  </addData>
</project>
`;
};

const projectStructure = (gemma: GemmaGrafcet): string => {
  return `\
<data name="http://www.3s-software.com/plcopenxml/projectstructure" handleUnknown="discard">
  <ProjectStructure>
    <Object Name="Device" ObjectId="a8da5055-ba3c-41dd-853b-ad72125a9af2">
      <Object Name="Application" ObjectId="f1bdda63-82df-4380-babf-520f8e0395d3">
        <Object Name="Administrador de bibliotecas" ObjectId="a13a8ff1-e760-4284-9d45-5ca949e70c2f" />
        <Object Name="MainTask" ObjectId="8d75883b-687d-4295-b9bf-1b088a8ac6b3" />
        <Object Name="GVL" ObjectId="ea459247-8ebb-40c6-ae2a-b2c7106e0e22" />
        <Object Name="GEMMA" ObjectId="${gemma.key}" />
        ${gemma.steps
          .filter(
            (s) => s.type === StepType.ENCLOSING || s.type === StepType.MACRO
          )
          .map((s) => `<Object Name="${s.name}" ObjectId="${s.key}" />`)
          .join("\n")}
      </Object>
    </Object>
  </ProjectStructure>
</data>
`;
};

const tasks = (): string => {
  return `\
<task name="MainTask" interval="PT0.02S" priority="1">
  <pouInstance name="GEMMA" typeName="">
    <documentation>
      <xhtml xmlns="http://www.w3.org/1999/xhtml" />
    </documentation>
  </pouInstance>
  <addData>
    <data name="http://www.3s-software.com/plcopenxml/tasksettings" handleUnknown="implementation">
      <TaskSettings KindOfTask="Cyclic" Interval="t#20ms" IntervalUnit="ms" WithinSPSTimeSlicing="true">
        <Watchdog Enabled="false" TimeUnit="ms" Sensitivity="1" />
      </TaskSettings>
    </data>
    <data name="http://www.3s-software.com/plcopenxml/objectid" handleUnknown="discard">
      <ObjectId>8d75883b-687d-4295-b9bf-1b088a8ac6b3</ObjectId>
    </data>
  </addData>
</task>
`;
};

const projectHeader = (): string => {
  const now = new Date();
  return `\
<fileHeader companyName="" productName="CODESYS" productVersion="CODESYS V3.5 SP11 Patch 3" creationDateTime="${now.toISOString()}" />
<contentHeader name="ControlLogic.project" modificationDateTime="${now.toISOString()}">
  <coordinateInfo>
    <fbd>
      <scaling x="1" y="1" />
    </fbd>
    <ld>
      <scaling x="1" y="1" />
    </ld>
    <sfc>
      <scaling x="1" y="1" />
    </sfc>
  </coordinateInfo>
  <addData>
    <data name="http://www.3s-software.com/plcopenxml/projectinformation" handleUnknown="implementation">
      <ProjectInformation />
    </data>
  </addData>
</contentHeader>
<types>
  <dataTypes />
  <pous />
</types>
`;
};

const libraries = (): string => {
  return `\
<data name="http://www.3s-software.com/plcopenxml/libraries" handleUnknown="implementation">
  <Libraries>
    <Library Name="#IoStandard" Namespace="IoStandard" HideWhenReferencedAsDependency="false" PublishSymbolsInContainer="false" SystemLibrary="true" LinkAllContent="true" DefaultResolution="IoStandard, 3.5.10.0 (System)" />
    <Library Name="#3SLicense" Namespace="_3S_LICENSE" HideWhenReferencedAsDependency="false" PublishSymbolsInContainer="false" SystemLibrary="true" LinkAllContent="false" DefaultResolution="3SLicense, 0.0.0.0 (3S - Smart Software Solutions GmbH)" ResolverGuid="97c3b452-d9fa-4ac2-9d0c-3d420aa6d95b" />
    <Library Name="#Standard" Namespace="Standard" HideWhenReferencedAsDependency="false" PublishSymbolsInContainer="false" SystemLibrary="false" LinkAllContent="false" DefaultResolution="Standard, * (System)" />
    <Library Name="#BreakpointLogging" Namespace="BPLog" HideWhenReferencedAsDependency="false" PublishSymbolsInContainer="false" SystemLibrary="true" LinkAllContent="false" DefaultResolution="Breakpoint Logging Functions, 3.5.5.0 (3S - Smart Software Solutions GmbH)" />
    <Library Name="#IecVarAccess" Namespace="IecVarAccessLibrary" HideWhenReferencedAsDependency="false" PublishSymbolsInContainer="false" SystemLibrary="true" LinkAllContent="false" DefaultResolution="IecVarAccess, 3.3.1.20 (System)" />
    <addData>
      <data name="http://www.3s-software.com/plcopenxml/objectid" handleUnknown="discard">
        <ObjectId>a13a8ff1-e760-4284-9d45-5ca949e70c2f</ObjectId>
      </data>
    </addData>
  </Libraries>
</data>
`;
};

const device = (codesysVersion: string | null): string => {
  return `\
<data name="Device" handleUnknown="discard">
  <Device xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="">
    <DeviceType>
      <DeviceIdentification>
        <Type>4096</Type>
        <Id>0000 0001</Id>
        <Version>${codesysVersion ?? "3.5.11.30"}</Version>
      </DeviceIdentification>
      <Connector moduleType="256" interface="Common.PCI" connectorId="0">
        <HostParameterSet />
      </Connector>
      <Connector moduleType="769" interface="SafetyInterface" connectorId="1">
        <HostParameterSet />
      </Connector>
      <DeviceParameterSet />
    </DeviceType>
  </Device>
</data>
`;
};
