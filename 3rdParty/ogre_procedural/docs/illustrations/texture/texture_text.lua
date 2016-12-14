buffer = Procedural.TextureBuffer(128)
Procedural.Cell(buffer):setDensity(4):setRegularity(234):process()
Procedural.TextTexture(buffer):setFont("Arial", 30):setColour(Procedural.ColourValue_Red):setPosition((size_t)20, (size_t)20):setText("OGRE"):process()
Procedural.TextTexture(buffer):setFont("Arial", 20):setColour(Procedural.ColourValue_Green):setPosition((size_t)10, (size_t)60):setText("Procedural"):process()
tests:addTextureBuffer(buffer)
dotfile = tests:getDotFile("texture_34", "Text_Demo")
dotfile:set("Cell", "texture_cell_smooth", "Text", "texture_text")