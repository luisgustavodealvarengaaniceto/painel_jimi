import React, { useState } from 'react';
import styled from 'styled-components';
import { Settings, Monitor, Clock, Palette, Save } from 'lucide-react';

const Container = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const Title = styled.h2`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: 600;
  margin: 0;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[6]};
`;

const SettingsCard = styled.div`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing[6]};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const CardIcon = styled.div`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  background: ${props => props.theme.colors.white};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.gray[700]};
  margin: 0;
`;

const ColorPicker = styled.input`
  width: 100px;
  height: 40px;
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: ${props => props.theme.radii.base};
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.radii.md};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${props => props.theme.spacing[6]};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HelperText = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin: ${props => props.theme.spacing[1]} 0 0 0;
`;

const ComingSoonBadge = styled.span`
  background: ${props => props.theme.colors.warning};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.base};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: 600;
  margin-left: ${props => props.theme.spacing[2]};
`;

const SettingsManager: React.FC = () => {
  const [displaySettings, setDisplaySettings] = useState({
    refreshInterval: 30,
    slideDuration: 10,
    showClock: true,
    showWeather: false,
    autoRefresh: true
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#09A0E9',
    secondaryColor: '#272D3B',
    backgroundColor: '#F8FAFC',
    darkMode: false
  });

  const handleSaveSettings = () => {
    // Aqui você implementaria a lógica para salvar as configurações
    alert('Configurações salvas com sucesso!');
  };

  return (
    <Container>
      <Header>
        <Settings />
        <Title>Configurações do Sistema</Title>
      </Header>

      <Content>
        <SettingsGrid>
          {/* Configurações de Display */}
          <SettingsCard>
            <CardHeader>
              <CardIcon>
                <Monitor />
              </CardIcon>
              <CardTitle>Configurações de Display</CardTitle>
            </CardHeader>

            <FormGroup>
              <Label>Intervalo de Atualização (segundos)</Label>
              <Input
                type="number"
                min="10"
                max="300"
                value={displaySettings.refreshInterval}
                onChange={(e) => setDisplaySettings({
                  ...displaySettings,
                  refreshInterval: Number(e.target.value)
                })}
              />
              <HelperText>
                Frequência de atualização dos dados do dashboard
              </HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Duração Padrão dos Slides (segundos)</Label>
              <Input
                type="number"
                min="5"
                max="60"
                value={displaySettings.slideDuration}
                onChange={(e) => setDisplaySettings({
                  ...displaySettings,
                  slideDuration: Number(e.target.value)
                })}
              />
            </FormGroup>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={displaySettings.showClock}
                  onChange={(e) => setDisplaySettings({
                    ...displaySettings,
                    showClock: e.target.checked
                  })}
                />
                <CheckboxLabel>Mostrar relógio no display</CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={displaySettings.showWeather}
                  onChange={(e) => setDisplaySettings({
                    ...displaySettings,
                    showWeather: e.target.checked
                  })}
                />
                <CheckboxLabel>
                  Mostrar previsão do tempo
                  <ComingSoonBadge>Em Breve</ComingSoonBadge>
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={displaySettings.autoRefresh}
                  onChange={(e) => setDisplaySettings({
                    ...displaySettings,
                    autoRefresh: e.target.checked
                  })}
                />
                <CheckboxLabel>Atualização automática</CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
          </SettingsCard>

          {/* Configurações de Tema */}
          <SettingsCard>
            <CardHeader>
              <CardIcon>
                <Palette />
              </CardIcon>
              <CardTitle>
                Configurações de Tema
                <ComingSoonBadge>Em Breve</ComingSoonBadge>
              </CardTitle>
            </CardHeader>

            <FormGroup>
              <Label>Cor Primária</Label>
              <ColorPicker
                type="color"
                value={themeSettings.primaryColor}
                onChange={(e) => setThemeSettings({
                  ...themeSettings,
                  primaryColor: e.target.value
                })}
              />
              <HelperText>
                Cor principal da interface (azul JIMI IOT)
              </HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Cor Secundária</Label>
              <ColorPicker
                type="color"
                value={themeSettings.secondaryColor}
                onChange={(e) => setThemeSettings({
                  ...themeSettings,
                  secondaryColor: e.target.value
                })}
              />
            </FormGroup>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={themeSettings.darkMode}
                  onChange={(e) => setThemeSettings({
                    ...themeSettings,
                    darkMode: e.target.checked
                  })}
                />
                <CheckboxLabel>Modo escuro</CheckboxLabel>
              </CheckboxGroup>
              <HelperText>
                Alterna entre tema claro e escuro
              </HelperText>
            </FormGroup>
          </SettingsCard>

          {/* Configurações Avançadas */}
          <SettingsCard>
            <CardHeader>
              <CardIcon>
                <Clock />
              </CardIcon>
              <CardTitle>
                Configurações Avançadas
                <ComingSoonBadge>Em Breve</ComingSoonBadge>
              </CardTitle>
            </CardHeader>

            <FormGroup>
              <Label>Fuso Horário</Label>
              <Select defaultValue="America/Sao_Paulo">
                <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                <option value="America/Rio_Branco">Rio Branco (UTC-5)</option>
                <option value="America/Manaus">Manaus (UTC-4)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Idioma da Interface</Label>
              <Select defaultValue="pt-BR">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </Select>
            </FormGroup>
          </SettingsCard>
        </SettingsGrid>

        <SaveButton onClick={handleSaveSettings}>
          <Save />
          Salvar Configurações
        </SaveButton>
      </Content>
    </Container>
  );
};

export default SettingsManager;
