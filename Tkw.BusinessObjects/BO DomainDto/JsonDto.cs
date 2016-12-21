namespace BusinessObjects
{
    public class Position
    {
        public double x { get; set; }
        public double y { get; set; }
    }

    public class Size
    {
        public int width { get; set; }
        public int height { get; set; }
    }

    public class Coords
    {
        public object x1 { get; set; }
        public object y1 { get; set; }
        public object x2 { get; set; }
        public object y2 { get; set; }
    }

    public class RootObject
    {
        public Position Position { get; set; }
        public Size Size { get; set; }
        public int Rotation { get; set; }
        public object Color { get; set; }
        public Coords Coords { get; set; }
    }
}
