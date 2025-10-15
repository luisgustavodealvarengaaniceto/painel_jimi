-- Create Akroz slides
INSERT INTO slides (title, content, duration, "order", is_active, tenant) 
VALUES ('Bem-vindo à Akroz Telematics', '<p><strong>Akroz Telematics</strong></p><p>Monitoramento avançado de frotas</p>', 10, 1, true, 'akroz');

-- Create Akroz fixed content
INSERT INTO fixed_content (type, content, is_active, "order", tenant) 
VALUES ('header', 'Akroz Telematics', true, 1, 'akroz');

INSERT INTO fixed_content (type, content, is_active, "order", tenant) 
VALUES ('footer', 'Soluções em Telemetria', true, 2, 'akroz');
